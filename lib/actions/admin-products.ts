"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { productSchema } from "@/lib/validations/admin";

export async function saveProduct(input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, name, slug, description, price, categoryId, images, variants } = parsed.data;

  try {
    if (id) {
      const keepIds = variants.filter((v) => v.id).map((v) => v.id!);
      await prisma.$transaction([
        prisma.product.update({
          where: { id },
          data: { name, slug, description, price, categoryId, images },
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
          categoryId,
          images,
          variants: {
            create: variants.map((v) => ({
              color: v.color,
              size: v.size,
              stock: v.stock,
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
