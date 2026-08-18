import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { ProductCard } from "@/components/shop/product-card";
import { searchProducts } from "@/lib/catalog";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q.trim() ? await searchProducts(q.trim()) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-10 px-6 py-16 sm:px-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-3xl">Resultados para &ldquo;{q}&rdquo;</h1>
          <p className="text-sm text-foreground/70">{products.length} productos</p>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-foreground/60">No encontramos productos para tu búsqueda.</p>
        ) : (
          <div className="grid w-full max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} slug={p.slug} name={p.name} price={p.price.toString()} color={p.swatchColor} img={p.cover} />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
