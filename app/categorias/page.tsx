import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCategoriesWithThumbnail } from "@/lib/catalog";

export const revalidate = 60;

export default async function CategoriasPage() {
  const categories = await getCategoriesWithThumbnail();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-10 px-6 py-16 sm:px-10">
        <Breadcrumb className="w-full max-w-5xl">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categorías</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-3xl">Categorías</h1>
        </div>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-16">
          {categories.map((c) => (
            <Link key={c.id} href={`/tienda/${c.slug}`} className="group flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-full bg-cream">
                {c.thumbnail && (
                  <Image
                    src={c.thumbnail}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                )}
              </div>
              <p className="text-center text-sm">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
