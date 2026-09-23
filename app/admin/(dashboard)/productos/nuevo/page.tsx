import { pbAdmin, type PBCategory } from "@/lib/pocketbase";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const pb = await pbAdmin();
  const categories = await pb.collection("categories").getFullList<PBCategory>({ sort: "name" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
