"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { bannerSchema } from "@/lib/validations/admin";

export async function saveBanner(input: unknown) {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, type, imageUrl, title, link, order } = parsed.data;

  try {
    const data = { type, imageUrl, title: title || null, link: link || null, order };
    if (id) {
      await prisma.banner.update({ where: { id }, data });
    } else {
      await prisma.banner.create({ data });
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
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[deleteBanner]", err);
    return { error: "No se pudo eliminar." };
  }
}
