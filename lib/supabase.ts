import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;

export const STORAGE_BUCKET = "boutiquemex";

export async function uploadImage(file: File, folder: string) {
  if (!supabaseAdmin) {
    // ponytail: sin claves de Supabase se guarda en public/uploads. Solo dev:
    // en Vercel el filesystem es efímero. Cargar SUPABASE_SERVICE_ROLE_KEY para prod.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Storage no configurado: falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    }
    return saveLocal(file, folder);
  }

  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const opts = { cacheControl: "3600", upsert: false };
  let { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(path, file, opts);

  // bucket inexistente: crearlo público y reintentar una vez
  if (error && /bucket not found/i.test(error.message)) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (createError) throw createError;
    ({ error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(path, file, opts));
  }
  if (error) throw error;

  return supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function saveLocal(file: File, folder: string) {
  const ext = file.name.split(".").pop();
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}
