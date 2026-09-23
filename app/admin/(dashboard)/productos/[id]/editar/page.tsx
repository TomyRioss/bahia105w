import { notFound } from "next/navigation";
import { pbAdmin, type PBCategory, type PBProduct, type PBVariant } from "@/lib/pocketbase";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pb = await pbAdmin();
  let product: PBProduct;
  try {
    product = await pb.collection("products").getOne<PBProduct>(id);
  } catch {
    notFound();
  }
  const [variants, categories] = await Promise.all([
    pb.collection("product_variants").getFullList<PBVariant>({ filter: `product="${id}"` }),
    pb.collection("categories").getFullList<PBCategory>({ sort: "name" }),
  ]);

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
          shippingPrice: product.shippingPrice?.toString() ?? null,
          categoryId: product.category,
          images: product.images ?? [],
          variants: variants.map((v) => ({
            id: v.id,
            color: v.color,
            size: v.size,
            stock: v.stock,
            price: v.price?.toString() ?? "",
            imageUrl: v.imageUrl ?? "",
            images: v.images ?? [],
            description: v.description ?? "",
          })),
        }}
      />
    </div>
  );
}
