// One-off: agrega campos autodate created/updated a las collections.
// Uso: PB_SUPER_PASS='...' node scripts/pb-add-dates.mjs
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");
await pb.collection("_superusers").authWithPassword("tomyrios2006@gmail.com", process.env.PB_SUPER_PASS);

for (const name of ["media", "categories", "products", "product_variants", "favorites", "banners", "orders", "order_items"]) {
  const c = await pb.collections.getOne(name);
  const fields = [...c.fields];
  if (!fields.some((f) => f.name === "created")) {
    fields.push({ name: "created", type: "autodate", onCreate: true });
  }
  if (!fields.some((f) => f.name === "updated")) {
    fields.push({ name: "updated", type: "autodate", onCreate: true, onUpdate: true });
  }
  await pb.collections.update(c.id, { fields });
  console.log("patched:", name);
}
console.log("DONE");
