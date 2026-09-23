// One-off: migra Postgres (Prisma) -> PocketBase. Mapea ids viejos->nuevos.
// Uso: PB_SUPER_PASS='...' POCKETBASE_URL='http://127.0.0.1:8090' node scripts/migrate-pg-to-pb.mjs
import "dotenv/config";
import { Client } from "pg";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword("tomyrios2006@gmail.com", process.env.PB_SUPER_PASS);

// legacyHash para login transparente de usuarios con password
try {
  const users = await pb.collections.getOne("users");
  if (!users.fields.some((f) => f.name === "legacyHash")) {
    await pb.collections.update(users.id, { fields: [...users.fields, { name: "legacyHash", type: "text" }] });
    console.log("users.legacyHash agregado");
  }
} catch (e) { console.log("legacyHash skip:", e?.message); }

const pg = new Client({ connectionString: process.env.DATABASE_URL });
await pg.connect();
const q = (t, order = '"createdAt" asc') =>
  pg.query(order ? `select * from "${t}" order by ${order}` : `select * from "${t}"`).then((r) => r.rows);
const num = (v) => (v === null || v === undefined ? null : Number(v));
const arr = (v) => (Array.isArray(v) ? v : []);
const map = {};
const put = (t, oldId, newId) => { (map[t] ??= {})[oldId] = newId; };
const get = (t, oldId) => (oldId ? map[t]?.[oldId] ?? null : null);

// users (passwords van a legacyHash; PB genera la suya)
for (const u of await q("User")) {
  const rec = await pb.collection("users").create({
    email: u.email, emailVisibility: true, verified: true,
    password: `Mig${u.id.slice(-8)}!x9`, passwordConfirm: `Mig${u.id.slice(-8)}!x9`,
    name: u.name ?? null, surname: u.surname ?? null, image: u.image ?? null,
    role: u.role ?? "USER", legacyHash: u.password ?? null,
  });
  put("User", u.id, rec.id);
}
console.log("users:", Object.keys(map.User ?? {}).length);

// categories / products / variants
for (const c of await q("Category")) {
  const rec = await pb.collection("categories").create({ name: c.name, slug: c.slug, image: c.image ?? null });
  put("Category", c.id, rec.id);
}
console.log("categories:", Object.keys(map.Category ?? {}).length);

for (const p of await q("Product")) {
  const rec = await pb.collection("products").create({
    name: p.name, slug: p.slug, description: p.description ?? "",
    price: num(p.price), shippingPrice: num(p.shippingPrice),
    images: arr(p.images), category: get("Category", p.categoryId),
  });
  put("Product", p.id, rec.id);
}
console.log("products:", Object.keys(map.Product ?? {}).length);

for (const v of await q("ProductVariant", null)) {
  const rec = await pb.collection("product_variants").create({
    product: get("Product", v.productId), color: v.color ?? "", size: v.size ?? "",
    stock: v.stock ?? 0, price: num(v.price), imageUrl: v.imageUrl ?? null,
    images: arr(v.images), description: v.description ?? null,
  });
  put("ProductVariant", v.id, rec.id);
}
console.log("variants:", Object.keys(map.ProductVariant ?? {}).length);

// banners
for (const b of await q("Banner")) {
  await pb.collection("banners").create({
    type: b.type, imageUrl: b.imageUrl,
    videoUrlDesktop: b.videoUrlDesktop ?? null, videoUrlMobile: b.videoUrlMobile ?? null,
    title: b.title ?? null, link: b.link ?? null, order: b.order ?? 0,
  });
}
console.log("banners ok");

// favorites
let favs = 0;
for (const f of await q("Favorite")) {
  const u = get("User", f.userId), p = get("Product", f.productId);
  if (!u || !p) continue;
  await pb.collection("favorites").create({ user: u, product: p });
  favs++;
}
console.log("favorites:", favs);

// orders + items
let ords = 0;
for (const o of await q("Order")) {
  const rec = await pb.collection("orders").create({
    user: get("User", o.userId), contactName: o.contactName, contactEmail: o.contactEmail,
    contactPhone: o.contactPhone, contactAddress: o.contactAddress ?? null,
    status: o.status ?? "PENDIENTE", total: num(o.total),
  });
  put("Order", o.id, rec.id);
  ords++;
  const items = await pg.query(`select * from "OrderItem" where "orderId" = $1`, [o.id]).then((r) => r.rows);
  for (const it of items) {
    await pb.collection("order_items").create({
      order: rec.id, variant: get("ProductVariant", it.productVariantId),
      quantity: it.quantity, price: num(it.price),
    });
  }
}
console.log("orders:", ords);
await pg.end();
console.log("MIGRATION DONE");
