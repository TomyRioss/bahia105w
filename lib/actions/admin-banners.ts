"use server";

import { revalidatePath } from "next/cache";
import { pbAdmin } from "@/lib/pocketbase";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { bannerSchema } from "@/lib/validations/admin";
import { uploadImage } from "@/lib/pb-storage";

export async function uploadBannerFile(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Archivo inválido." };

  try {
    const url = await uploadImage(file, "banners");
    return { url };
  } catch (err) {
    console.error("[uploadBannerFile]", err);
    return { error: "No se pudo subir el archivo." };
  }
}

export async function saveBanner(input: unknown) {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, type, imageUrl, videoUrlDesktop, videoUrlMobile, title, link, order } = parsed.data;

  try {
    const pb = await pbAdmin();
    const data = {
      type,
      imageUrl,
      videoUrlDesktop: videoUrlDesktop || null,
      videoUrlMobile: videoUrlMobile || null,
      title: title || null,
      link: link || null,
      order,
    };
    if (id) {
      await pb.collection("banners").update(id, data);
    } else {
      await pb.collection("banners").create(data);
    }
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[saveBanner]", err);
    return { error: "No se pudo guardar." };
  }
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  try {
    const pb = await pbAdmin();
    await pb.collection("banners").delete(id);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[deleteBanner]", err);
    return { error: "No se pudo eliminar." };
  }
}
