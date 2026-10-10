// One-off: crea collections de boutiquemex en PocketBase.
// Uso: PB_SUPER_PASS='...' node scripts/setup-pb.mjs
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");
await pb.collection("_superusers").authWithPassword("tomyrios2006@gmail.com", process.env.PB_SUPER_PASS);

const text = (name, o = {}) => ({ name, type: "text", ...o });
const num = (name, o = {}) => ({ name, type: "number", ...o });
const url = (name, o = {}) => ({ name, type: "url", ...o });
const j = (name, o = {}) => ({ name, type: "json", ...o });
const rel = (name, collectionId, o = {}) => ({
  name, type: "relation", collectionId, maxSelect: 1, ...o,
});
const sel = (name, values, o = {}) => ({ name, type: "select", values, maxSelect: 1, ...o });

const ADMIN_WRITE = {
  createRule: '@request.auth.role = "ADMIN" || @request.auth.role = "OWNER"',
  updateRule: '@request.auth.role = "ADMIN" || @request.auth.role = "OWNER"',
  deleteRule: '@request.auth.role = "ADMIN" || @request.auth.role = "OWNER"',
};
const PUBLIC_READ = { listRule: "", viewRule: "" };
// Dueño del registro o admin/owner (para collections con campo `user`).
const OWNER_OR_ADMIN_LIST =
  "user = @request.auth.id || @request.auth.role = \"ADMIN\" || @request.auth.role = \"OWNER\"";

async function ensure(def) {
  // En PB 0.40 created/updated son campos autodate explícitos: agregarlos siempre.
  if ((def.type === "base" || def.type === "auth") && Array.isArray(def.fields)) {
    if (!def.fields.some((f) => f.name === "created")) {
      def.fields.push({ name: "created", type: "autodate", onCreate: true });
    }
    if (!def.fields.some((f) => f.name === "updated")) {
      def.fields.push({ name: "updated", type: "autodate", onCreate: true, onUpdate: true });
    }
  }
  try {
    const c = await pb.collections.create(def);
    console.log("created:", c.name);
    return c;
  } catch (e) {
    if (e?.data?.data?.name?.code === "validation_collection_name_exists") {
      const c = await pb.collections.getOne(def.name);
      console.log("exists:", c.name);
      // Aplicar rules vigentes a colecciones ya creadas (script idempotente).
      const { listRule, viewRule, createRule, updateRule, deleteRule } = def;
      await pb.collections.update(c.id, { listRule, viewRule, createRule, updateRule, deleteRule });
      console.log("rules updated:", c.name);
      return c;
    }
    throw e;
  }
}

const users = await pb.collections.getOne("users");
console.log("users id:", users.id);

await ensure({
  name: "media", type: "base",
  fields: [
    { name: "file", type: "file", required: true, maxSize: 15728640, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"] },
    text("folder"),
  ],
  listRule: "", viewRule: "",
  // Solo admins suben/borran (la app lo hace vía superuser). Evita spam de
  // archivos de 15MB por API directa. Lectura pública: las imágenes del
  // storefront se sirven directo desde PB al browser.
  createRule: ADMIN_WRITE.createRule,
  updateRule: ADMIN_WRITE.updateRule, deleteRule: ADMIN_WRITE.deleteRule,
});

const categories = await ensure({
  name: "categories", type: "base",
  fields: [text("name", { required: true }), text("slug", { required: true }), url("image")],
  indexes: ["CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)"],
  ...PUBLIC_READ, ...ADMIN_WRITE,
});

const products = await ensure({
  name: "products", type: "base",
  fields: [
    text("name", { required: true }), text("slug", { required: true }),
    text("description"), num("price", { required: true }), num("shippingPrice"),
    j("images"), rel("category", categories.id, { required: true }),
  ],
  indexes: ["CREATE UNIQUE INDEX idx_products_slug ON products (slug)"],
  ...PUBLIC_READ, ...ADMIN_WRITE,
});

const variants = await ensure({
  name: "product_variants", type: "base",
  fields: [
    rel("product", products.id, { required: true, cascadeDelete: true }),
    text("color"), text("size"), num("stock"), num("price"),
    url("imageUrl"), j("images"), text("description"),
  ],
  ...PUBLIC_READ, ...ADMIN_WRITE,
});

await ensure({
  name: "favorites", type: "base",
  fields: [rel("user", users.id, { required: true, cascadeDelete: true }), rel("product", products.id, { required: true, cascadeDelete: true })],
  indexes: ["CREATE UNIQUE INDEX idx_fav_user_product ON favorites (user, product)"],
  // Cada usuario solo ve y toca sus propios favoritos (antes: cualquier
  // autenticado listaba los de todos vía API directa a PB).
  listRule: "user = @request.auth.id", viewRule: "user = @request.auth.id",
  createRule: "@request.auth.id != ''", updateRule: "user = @request.auth.id", deleteRule: "user = @request.auth.id",
});

await ensure({
  name: "banners", type: "base",
  fields: [
    sel("type", ["HERO", "FLYER", "BANNER"], { required: true }),
    url("imageUrl", { required: true }), url("videoUrlDesktop"), url("videoUrlMobile"),
    text("title"), text("link"), num("order"),
  ],
  ...PUBLIC_READ, ...ADMIN_WRITE,
});

const orders = await ensure({
  name: "orders", type: "base",
  fields: [
    rel("user", users.id, { required: false }),
    text("contactName", { required: true }),
    { name: "contactEmail", type: "email", required: true },
    text("contactPhone", { required: true }), text("contactAddress"),
    sel("status", ["PENDIENTE", "CONFIRMADO", "COMPLETADO"]),
    num("total", { required: true }),
  ],
  // Dueño o admin/owner (antes: cualquier autenticado listaba TODOS los
  // pedidos con PII vía API directa a PB). El checkout de invitados pasa por
  // Next.js con superuser, así que no necesita createRule público.
  listRule: OWNER_OR_ADMIN_LIST, viewRule: OWNER_OR_ADMIN_LIST,
  createRule: "@request.auth.id != ''", updateRule: ADMIN_WRITE.updateRule, deleteRule: ADMIN_WRITE.deleteRule,
});

await ensure({
  name: "order_items", type: "base",
  fields: [
    rel("order", orders.id, { required: true, cascadeDelete: true }),
    rel("variant", variants.id, { required: true }),
    num("quantity", { required: true }), num("price", { required: true }),
  ],
  // Sin creates anónimos (la app crea vía superuser). Items sueltos sin
  // contacto no exponen PII, alcanza con exigir autenticación para leer.
  listRule: "@request.auth.id != ''", viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''", updateRule: ADMIN_WRITE.updateRule, deleteRule: ADMIN_WRITE.deleteRule,
});

// Extender users: surname, role, image
const userFields = [...users.fields];
for (const f of [text("surname"), sel("role", ["USER", "ADMIN", "OWNER"]), url("image")]) {
  if (!userFields.some((x) => x.name === f.name)) userFields.push(f);
}
await pb.collections.update(users.id, {
  fields: userFields,
  // Auth collection blindada: nadie puede auto-escalarse el rol por API
  // directa (un create/update con role=ADMIN quedaría como admin real).
  // Todo el registro y la gestión pasan por Next.js con superuser.
  listRule: ADMIN_WRITE.createRule,
  viewRule: 'id = @request.auth.id || @request.auth.role = "ADMIN" || @request.auth.role = "OWNER"',
  createRule: ADMIN_WRITE.createRule,
  updateRule: ADMIN_WRITE.updateRule,
  deleteRule: ADMIN_WRITE.deleteRule,
});
console.log("users extended OK");
console.log("DONE");
