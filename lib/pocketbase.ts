import "server-only";
import PocketBase from "pocketbase";

// Cliente PocketBase solo-servidor (superuser, bypassa rules).
// Nunca importar desde Client Components.

function baseUrl() {
  const url = process.env.POCKETBASE_URL;
  if (!url) throw new Error("Falta POCKETBASE_URL en el entorno.");
  return url;
}

let cachedToken = "";
let cachedExp = 0;

export async function pbAdmin() {
  const pb = new PocketBase(baseUrl());
  const now = Date.now() / 1000;
  if (cachedToken && now < cachedExp - 300) {
    pb.authStore.save(cachedToken);
    return pb;
  }
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL;
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD;
  if (!email || !password) throw new Error("Faltan credenciales de PocketBase en el entorno.");
  const auth = await pb.collection("_superusers").authWithPassword(email, password);
  cachedToken = auth.token;
  try {
    cachedExp = JSON.parse(Buffer.from(auth.token.split(".")[1], "base64").toString()).exp ?? 0;
  } catch {
    cachedExp = now + 12 * 3600;
  }
  return pb;
}

export function clearPbCache() {
  cachedToken = "";
  cachedExp = 0;
}

/** Escapa un valor para interpolarlo en un filtro PB entre comillas dobles. */
export function esc(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// --- Tipos (records de PocketBase) ---

export interface PBCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  created: string;
  expand?: Record<string, unknown>;
}

export interface PBProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  shippingPrice?: number;
  images: string[];
  category: string;
  created: string;
  expand?: Record<string, unknown>;
}

export interface PBVariant {
  id: string;
  product: string;
  color: string;
  size: string;
  stock: number;
  price?: number;
  imageUrl?: string;
  images: string[];
  description?: string;
  expand?: Record<string, unknown>;
}

export interface PBBanner {
  id: string;
  type: "HERO" | "FLYER" | "BANNER";
  imageUrl: string;
  videoUrlDesktop?: string;
  videoUrlMobile?: string;
  title?: string;
  link?: string;
  order: number;
  created: string;
  expand?: Record<string, unknown>;
}

export type OrderStatus = "PENDIENTE" | "CONFIRMADO" | "COMPLETADO";

export interface PBOrder {
  id: string;
  user?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress?: string;
  status: OrderStatus;
  total: number;
  created: string;
}

export interface PBOrderItem {
  id: string;
  order: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface PBUser {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  role: "USER" | "ADMIN" | "OWNER";
  image?: string;
  verified: boolean;
  created: string;
}

export interface PBMedia {
  id: string;
  file: string;
  folder?: string;
}

/** URL pública de un archivo subido a una collection con acceso público. */
export function pbFileUrl(collection: string, recordId: string, filename: string) {
  return `${baseUrl()}/api/files/${collection}/${recordId}/${encodeURIComponent(filename)}`;
}
