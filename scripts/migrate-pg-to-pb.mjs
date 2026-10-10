// Reanudable: migra Postgres (Prisma) -> PocketBase sin duplicar registros.
// Uso: node scripts/migrate-pg-to-pb.mjs
import "dotenv/config";
import { Client } from "pg";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL);
const pg = new Client({ connectionString: process.env.DATABASE_URL });
const esc = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const num = (value) => (value === null || value === undefined ? null : Number(value));
const arr = (value) => (Array.isArray(value) ? value : []);
const maps = {};

const put = (type, oldId, newId) => ((maps[type] ??= {})[oldId] = newId);
const get = (type, oldId) => (oldId ? maps[type]?.[oldId] ?? null : null);

async function records(table, order = '"createdAt" asc') {
  const sql = order ? `select * from "${table}" order by ${order}` : `select * from "${table}"`;
  return (await pg.query(sql)).rows;
}

async function ensureLegacyId(collectionName) {
  const collection = await pb.collections.getOne(collectionName);
  if (!collection.fields.some((field) => field.name === "legacyId")) {
    await pb.collections.update(collection.id, {
      fields: [...collection.fields, { name: "legacyId", type: "text" }],
    });
  }
}

async function find(collectionName, filter) {
  try {
    return await pb.collection(collectionName).getFirstListItem(filter);
  } catch {
    return null;
  }
}

async function upsert(collectionName, legacyId, data, fallbackFilter) {
  const collection = pb.collection(collectionName);
  const existing = (await find(collectionName, `legacyId="${esc(legacyId)}"`))
    ?? (fallbackFilter ? await find(collectionName, fallbackFilter) : null);
  const payload = { ...data, legacyId };
  return existing ? collection.update(existing.id, payload) : collection.create(payload);
}

await pb.collection("_superusers").authWithPassword(
  process.env.POCKETBASE_SUPERUSER_EMAIL,
  process.env.POCKETBASE_SUPERUSER_PASSWORD,
);
await pg.connect();

for (const name of ["users", "categories", "products", "product_variants", "favorites", "banners", "orders", "order_items"]) {
  await ensureLegacyId(name);
}

for (const user of await records("User")) {
  const password = `Mig${user.id.slice(-8)}!x9`;
  const existing = (await find("users", `legacyId="${esc(user.id)}"`))
    ?? (await find("users", `email="${esc(user.email)}"`));
  const data = {
    email: user.email,
    emailVisibility: true,
    verified: true,
    name: user.name ?? "",
    surname: user.surname ?? "",
    image: user.image ?? "",
    role: user.role ?? "USER",
    legacyHash: user.password ?? "",
  };
  const rec = existing
    ? await pb.collection("users").update(existing.id, { ...data, legacyId: user.id })
    : await pb.collection("users").create({ ...data, legacyId: user.id, password, passwordConfirm: password });
  put("User", user.id, rec.id);
}
console.log("users ok:", Object.keys(maps.User ?? {}).length);

for (const category of await records("Category")) {
  const rec = await upsert("categories", category.id, { name: category.name, slug: category.slug, image: category.image ?? "" }, `slug="${esc(category.slug)}"`);
  put("Category", category.id, rec.id);
}
console.log("categories ok:", Object.keys(maps.Category ?? {}).length);

for (const product of await records("Product")) {
  const rec = await upsert(
    "products",
    product.id,
    { name: product.name, slug: product.slug, description: product.description ?? "", price: num(product.price), shippingPrice: num(product.shippingPrice), images: arr(product.images), category: get("Category", product.categoryId) },
    `slug="${esc(product.slug)}"`,
  );
  put("Product", product.id, rec.id);
}
console.log("products ok:", Object.keys(maps.Product ?? {}).length);

for (const variant of await records("ProductVariant", null)) {
  const productId = get("Product", variant.productId);
  if (!productId) continue;
  const rec = await upsert(
    "product_variants",
    variant.id,
    { product: productId, color: variant.color ?? "", size: variant.size ?? "", stock: variant.stock ?? 0, price: num(variant.price), imageUrl: variant.imageUrl ?? "", images: arr(variant.images), description: variant.description ?? "" },
    `product="${esc(productId)}"&&color="${esc(variant.color)}"&&size="${esc(variant.size)}"`,
  );
  put("ProductVariant", variant.id, rec.id);
}
console.log("variants ok:", Object.keys(maps.ProductVariant ?? {}).length);

for (const banner of await records("Banner")) {
  await upsert(
    "banners",
    banner.id,
    { type: banner.type, imageUrl: banner.imageUrl, videoUrlDesktop: banner.videoUrlDesktop ?? "", videoUrlMobile: banner.videoUrlMobile ?? "", title: banner.title ?? "", link: banner.link ?? "", order: banner.order ?? 0 },
    `type="${esc(banner.type)}"&&imageUrl="${esc(banner.imageUrl)}"`,
  );
}
console.log("banners ok");

for (const favorite of await records("Favorite")) {
  const userId = get("User", favorite.userId);
  const productId = get("Product", favorite.productId);
  if (!userId || !productId) continue;
  await upsert("favorites", favorite.id, { user: userId, product: productId }, `user="${esc(userId)}"&&product="${esc(productId)}"`);
}
console.log("favorites ok");

for (const order of await records("Order")) {
  const rec = await upsert(
    "orders",
    order.id,
    { user: get("User", order.userId), contactName: order.contactName, contactEmail: order.contactEmail, contactPhone: order.contactPhone, contactAddress: order.contactAddress ?? "", status: order.status ?? "PENDIENTE", total: num(order.total) },
    `contactEmail="${esc(order.contactEmail)}"&&contactName="${esc(order.contactName)}"&&total=${num(order.total) ?? 0}`,
  );
  put("Order", order.id, rec.id);

  const items = await pg.query('select * from "OrderItem" where "orderId" = $1', [order.id]);
  for (const item of items.rows) {
    const variantId = get("ProductVariant", item.productVariantId);
    if (!variantId) continue;
    await upsert(
      "order_items",
      item.id,
      { order: rec.id, variant: variantId, quantity: item.quantity, price: num(item.price) },
      `order="${esc(rec.id)}"&&variant="${esc(variantId)}"&&quantity=${item.quantity}&&price=${num(item.price) ?? 0}`,
    );
  }
}
console.log("orders ok:", Object.keys(maps.Order ?? {}).length);

await pg.end();
console.log("MIGRATION DONE");
