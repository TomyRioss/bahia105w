import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl">Editar producto</h1>
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          categoryId: product.categoryId,
          images: product.images,
          variants: product.variants.map((v) => ({
            id: v.id,
            color: v.color,
            size: v.size,
            stock: v.stock,
            imageUrl: v.imageUrl ?? "",
            images: v.images,
            description: v.description ?? "",
          })),
        }}
      />
    </div>
  );
}
