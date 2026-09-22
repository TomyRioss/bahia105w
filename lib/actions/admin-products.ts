"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { productSchema } from "@/lib/validations/admin";
import { uploadImage } from "@/lib/supabase";

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
    if (id) {
      const keepIds = variants.filter((v) => v.id).map((v) => v.id!);
      await prisma.$transaction([
        prisma.product.update({
          where: { id },
          data: { name, slug, description, price, shippingPrice: shippingPrice ?? null, categoryId, images },
        }),
        prisma.productVariant.deleteMany({
          where: { productId: id, id: { notIn: keepIds.length ? keepIds : ["__none__"] } },
        }),
        ...variants.map((v) =>
          v.id
            ? prisma.productVariant.update({
                where: { id: v.id },
                data: {
                  color: v.color,
                  size: v.size,
                  stock: v.stock,
                  price: v.price ?? null,
                  imageUrl: v.imageUrl || null,
                  images: v.images,
                  description: v.description || null,
                },
              })
            : prisma.productVariant.create({
                data: {
                  productId: id,
                  color: v.color,
                  size: v.size,
                  stock: v.stock,
                  price: v.price ?? null,
                  imageUrl: v.imageUrl || null,
                  images: v.images,
                  description: v.description || null,
                },
              })
        ),
      ]);
    } else {
      await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price,
          shippingPrice: shippingPrice ?? null,
          categoryId,
          images,
          variants: {
            create: variants.map((v) => ({
              color: v.color,
              size: v.size,
              stock: v.stock,
              price: v.price ?? null,
              imageUrl: v.imageUrl || null,
              images: v.images,
              description: v.description || null,
            })),
          },
        },
      });
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
    await prisma.product.delete({ where: { id } });
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
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
      select: { product: { select: { slug: true } } },
    });
    revalidatePath("/admin/productos");
    revalidatePath(`/producto/${variant.product.slug}`);
    return { ok: true };
  } catch (err) {
    console.error("[updateVariantStock]", err);
    return { error: "No se pudo actualizar el stock." };
  }
}
