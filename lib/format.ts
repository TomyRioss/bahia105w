export function formatPrice(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  const formatted = n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `$${formatted} MXN`;
}
