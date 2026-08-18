import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { ProductCard } from "@/components/shop/product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProductsByCategory } from "@/lib/catalog";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductsByCategory(slug);
  if (!data) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-10 px-6 py-16 sm:px-10">
        <Breadcrumb className="w-full max-w-6xl">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/categorias">Categorías</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-3xl">{data.category.name}</h1>
          <p className="text-sm text-foreground/70">{data.products.length} productos</p>
        </div>
        {data.products.length === 0 ? (
          <p className="text-sm text-foreground/60">Aún no hay productos en esta categoría.</p>
        ) : (
          <div className="grid w-full max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
            {data.products.map((p) => (
              <ProductCard key={p.id} slug={p.slug} name={p.name} price={p.price.toString()} color={p.swatchColor} img={p.cover} />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
