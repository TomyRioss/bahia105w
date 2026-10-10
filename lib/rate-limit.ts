import "server-only";

// Throttle en memoria (por instancia). Frena fuerza bruta oportunista en
// login/registro. Si se escala a múltiples instancias, migrar a Redis/Upstash.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Evitar crecimiento sin cota.
  if (hits.size > 5000) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
  return true;
}
