import "server-only";
import { pbAdmin, pbFileUrl, type PBMedia } from "@/lib/pocketbase";

/** Sube un archivo al storage de PocketBase (collection `media`) y devuelve su URL pública. */
export async function uploadImage(file: File, folder: string) {
  if (process.env.NODE_ENV === "production" && !process.env.POCKETBASE_URL) {
    throw new Error("Storage no configurado: falta POCKETBASE_URL.");
  }
  const pb = await pbAdmin();
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const rec = await pb.collection("media").create<PBMedia>(form);
  return pbFileUrl("media", rec.id, rec.file);
}
