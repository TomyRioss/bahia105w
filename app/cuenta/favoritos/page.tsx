import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pbAdmin, esc, type PBVariant } from "@/lib/pocketbase";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { ProductCard } from "@/components/shop/product-card";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pb = await pbAdmin();
  const favorites = await pb.collection("favorites").getFullList({
    filter: `user="${esc(session.user.id)}"`,
    sort: "-created",
    expand: "product",
  });
  const productIds = favorites.map((f) => f.expand?.product?.id as string).filter(Boolean);
  let variants: PBVariant[] = [];
  if (productIds.length > 0) {
    variants = await pb.collection("product_variants").getFullList<PBVariant>({
      filter: productIds.map((id) => `product="${esc(id)}"`).join("||"),
    });
  }
  const firstVariant = new Map<string, PBVariant>();
  for (const v of variants) {
    if (!firstVariant.has(v.product)) firstVariant.set(v.product, v);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-10 px-6 py-16 sm:px-10">
        <h1 className="font-serif text-3xl">Mis favoritos</h1>
        {favorites.length === 0 ? (
          <p className="text-sm text-foreground/60">Todavía no guardaste productos.</p>
        ) : (
          <div className="grid w-full max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
            {favorites.map((f) => {
              const p = f.expand?.product as { id: string; slug: string; name: string; price: number };
              const v = firstVariant.get(p.id);
              return (
                <ProductCard
                  key={f.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price.toString()}
                  color={v?.color ?? null}
                  img={v?.imageUrl ?? null}
                />
              );
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
