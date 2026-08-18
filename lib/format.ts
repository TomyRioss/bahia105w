export function formatPrice(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
