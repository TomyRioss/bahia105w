"use server";

import { revalidatePath } from "next/cache";
import { pbAdmin, esc, type PBVariant } from "@/lib/pocketbase";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { productSchema } from "@/lib/validations/admin";
import { uploadImage } from "@/lib/pb-storage";

export async function uploadProductFiles(formData: FormData) {
  await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Archivo inválido." };

  try {
    const urls = await Promise.all(files.map((f) => uploadImage(f, "productos")));
    return { urls };
  } catch (err) {
    console.error("[uploadProductFiles]", err);
    return { error: "No se pudo subir el archivo." };
  }
}

export async function saveProduct(input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, name, slug, description, price, shippingPrice, categoryId, images, standardStock, standardVariantId } =
    parsed.data;

  const variants = [
    {
      id: standardVariantId,
      color: "",
      size: "Única",
      stock: standardStock ?? 0,
      price: undefined,
      imageUrl: "",
      images: [],
      description: "",
    },
    ...parsed.data.variants,
  ];

  try {
    const pb = await pbAdmin();
    const toVariantData = (v: (typeof variants)[number]) => ({
      color: v.color,
      size: v.size,
      stock: v.stock,
      price: v.price ?? null,
      imageUrl: v.imageUrl || null,
      images: v.images,
      description: v.description || null,
    });

    if (id) {
      const keepIds = variants.filter((v) => v.id).map((v) => v.id!);
      await pb.collection("products").update(id, {
        name, slug, description, price, shippingPrice: shippingPrice ?? null, category: categoryId, images,
      });
      const existing = await pb.collection("product_variants").getFullList<PBVariant>({
        filter: `product="${esc(id)}"`,
      });
      for (const ev of existing) {
        if (!keepIds.includes(ev.id)) await pb.collection("product_variants").delete(ev.id);
      }
      for (const v of variants) {
        if (v.id) {
          await pb.collection("product_variants").update(v.id, toVariantData(v));
        } else {
          await pb.collection("product_variants").create({ ...toVariantData(v), product: id });
        }
      }
    } else {
      const product = await pb.collection("products").create({
        name, slug, description, price, shippingPrice: shippingPrice ?? null, category: categoryId, images,
      });
      for (const v of variants) {
        await pb.collection("product_variants").create({ ...toVariantData(v), product: product.id });
      }
    }

    revalidatePath("/admin/productos");
    revalidatePath("/");
    revalidatePath(`/producto/${slug}`);
    return { ok: true };
  } catch (err) {
    console.error("[saveProduct]", err);
    return { error: "No se pudo guardar el producto." };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  try {
    const pb = await pbAdmin();
    await pb.collection("products").delete(id);
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[deleteProduct]", err);
    return { error: "No se pudo eliminar el producto." };
  }
}

export async function updateVariantStock(variantId: string, stock: number) {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock inválido." };

  try {
    const pb = await pbAdmin();
    const variant = await pb.collection("product_variants").update(variantId, { stock });
    const product = await pb.collection("products").getOne(variant.product as string);
    revalidatePath("/admin/productos");
    revalidatePath(`/producto/${product.slug}`);
    return { ok: true };
  } catch (err) {
    console.error("[updateVariantStock]", err);
    return { error: "No se pudo actualizar el stock." };
  }
}
