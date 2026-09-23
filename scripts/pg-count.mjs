// One-off: cuenta filas en Postgres (no imprime secretos).
import "dotenv/config";
import { Client } from "pg";

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
for (const t of ["users", "categories", "products", "product_variants", "favorites", "banners", "orders", "order_items"]) {
  try {
    const r = await c.query(`select count(*)::int as n from "${t}"`);
    console.log(t, r.rows[0].n);
  } catch {
    console.log(t, "NO_TABLE");
  }
}
const cred = await c.query(`select count(*)::int as n from "users" where password is not null`).catch(() => null);
if (cred) console.log("users_con_password", cred.rows[0].n);
await c.end();
