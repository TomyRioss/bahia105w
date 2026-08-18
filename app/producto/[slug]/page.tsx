import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { ProductCard } from "@/components/shop/product-card";
import { ProductView } from "@/components/shop/product-view";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { sameCategory, recommended } = await getRelatedProducts(product.id, product.categoryId);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
      <ProductView
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          images: product.images,
          category: product.category,
          variants: product.variants.map((v) => ({
            id: v.id,
            color: v.color,
            size: v.size,
            imageUrl: v.imageUrl,
            images: v.images,
            description: v.description,
          })),
        }}
      />

      {sameCategory.length > 0 && (
        <section className="flex flex-col gap-6 px-6 py-10 sm:px-10">
          <h2 className="font-serif text-2xl">Te puede gustar en {product.category.name}</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {sameCategory.map((p) => (
              <ProductCard key={p.id} slug={p.slug} name={p.name} price={p.price.toString()} color={p.swatchColor} img={p.cover} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="flex flex-col gap-6 px-6 py-10 sm:px-10">
          <h2 className="font-serif text-2xl">Recomendados</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {recommended.map((p) => (
              <ProductCard key={p.id} slug={p.slug} name={p.name} price={p.price.toString()} color={p.swatchColor} img={p.cover} />
            ))}
          </div>
        </section>
      )}
      </main>

      <SiteFooter />
    </div>
  );
}
