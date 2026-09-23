"use server";

import { revalidatePath } from "next/cache";
import { pbAdmin } from "@/lib/pocketbase";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { categorySchema } from "@/lib/validations/admin";

export async function saveCategory(input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, slug, image } = parsed.data;
  const id = (input as { id?: string }).id;

  try {
    const pb = await pbAdmin();
    const data = { name, slug, image: image || null };
    if (id) {
      await pb.collection("categories").update(id, data);
    } else {
      await pb.collection("categories").create(data);
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
    const pb = await pbAdmin();
    await pb.collection("categories").delete(id);
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[deleteCategory]", err);
    return { error: "No se pudo eliminar. Verificá que no tenga productos asociados." };
  }
}
