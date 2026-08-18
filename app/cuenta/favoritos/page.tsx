import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { ProductCard } from "@/components/shop/product-card";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { variants: { take: 1 } } } },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-10 px-6 py-16 sm:px-10">
        <h1 className="font-serif text-3xl">Mis favoritos</h1>
        {favorites.length === 0 ? (
          <p className="text-sm text-foreground/60">Todavía no guardaste productos.</p>
        ) : (
          <div className="grid w-full max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
            {favorites.map((f) => (
              <ProductCard
                key={f.id}
                slug={f.product.slug}
                name={f.product.name}
                price={f.product.price.toString()}
                color={f.product.variants[0]?.color ?? null}
                img={f.product.variants[0]?.imageUrl ?? null}
              />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
