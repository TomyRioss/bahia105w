"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { categorySchema } from "@/lib/validations/admin";

export async function saveCategory(input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, slug } = parsed.data;
  const id = (input as { id?: string }).id;

  try {
    if (id) {
      await prisma.category.update({ where: { id }, data: { name, slug } });
    } else {
      await prisma.category.create({ data: { name, slug } });
    }
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[saveCategory]", err);
    return { error: "No se pudo guardar la categoría." };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[deleteCategory]", err);
    return { error: "No se pudo eliminar. Verificá que no tenga productos asociados." };
  }
}
