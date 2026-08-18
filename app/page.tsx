import Image from "next/image";
import Link from "next/link";
import { FiPackage, FiTruck } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { HeroVideo } from "@/components/shop/hero-video";
import { ProductMarquee } from "@/components/shop/product-marquee";
import { getBanners, getCategoriesWithThumbnail, getProductsWithCover } from "@/lib/catalog";

export const revalidate = 60;

export default async function Home() {
  const [flyers, banners, categories, products] = await Promise.all([
    getBanners("FLYER"),
    getBanners("BANNER"),
    getCategoriesWithThumbnail(),
    getProductsWithCover(8),
  ]);

  const [flyerLeft, flyerRight] = flyers;
  const centerBanner = banners[0];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader overHero />
      <main className="flex-1">

      <HeroVideo />

      <section className="flex flex-col items-center gap-10 bg-cream px-6 py-20 sm:px-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-serif text-3xl">Colecciones destacadas</h2>
          <p className="text-sm text-foreground/70">Cada prenda está bordada a mano, haciendo cada pieza única.</p>
        </div>
        <ProductMarquee
          products={products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price.toString(), cover: p.cover }))}
        />
      </section>

      <section className="flex flex-col items-center gap-10 px-6 py-20 sm:px-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-serif text-3xl">Categorías</h2>
        </div>
        <div className="grid w-full grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-16">
          {categories.map((c) => (
            <Link key={c.id} href={`/tienda/${c.slug}`} className="group flex flex-col items-center gap-3">
              <div className="relative h-40 w-40 overflow-hidden rounded-full bg-cream sm:h-48 sm:w-48">
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

      {(flyerLeft || centerBanner || flyerRight) && (
        <section className="grid grid-cols-1 sm:grid-cols-3">
          {flyerLeft && (
            <div className="relative aspect-square">
              <Image src={flyerLeft.imageUrl} alt={flyerLeft.title ?? ""} fill className="object-cover" />
            </div>
          )}
          {centerBanner && (
            <div className="relative flex aspect-square items-center justify-center">
              <Image src={centerBanner.imageUrl} alt={centerBanner.title ?? ""} fill className="object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 text-center text-white">
                {centerBanner.title && <p className="max-w-xs font-serif text-2xl">{centerBanner.title}</p>}
                {centerBanner.link && (
                  <Link href={centerBanner.link} className="rounded-full bg-white px-6 py-2 text-sm text-foreground">
                    Ver colección
                  </Link>
                )}
              </div>
            </div>
          )}
          {flyerRight && (
            <div className="relative aspect-square">
              <Image src={flyerRight.imageUrl} alt={flyerRight.title ?? ""} fill className="object-cover" />
            </div>
          )}
        </section>
      )}

      <section className="flex flex-col items-center gap-10 bg-cream px-6 py-20 text-center sm:px-10">
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-serif text-3xl">¿Quiénes somos?</h2>
          <p className="max-w-xl text-sm text-foreground/70">
            Somos Bahía 105W, un espacio dedicado a piezas hechas a mano en México. Cada prenda está bordada por
            artesanas mexicanas, celebrando la tradición y el trabajo manual detrás de cada diseño.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="https://wa.me/5213222942660"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FaWhatsapp className="h-5 w-5" />
            +52 1 322 294 2660
          </Link>
          <Link
            href="https://www.instagram.com/bahia_105w?igsi=NjAxYWFiNGt3emMy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FaInstagram className="h-5 w-5" />
            Instagram
          </Link>
          <Link
            href="https://www.facebook.com/share/196VwdM7LU/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#1877F2] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FaFacebookF className="h-5 w-5" />
            Facebook
          </Link>
        </div>
      </section>

      <section id="nosotros" className="grid grid-cols-1 gap-10 px-6 py-16 text-center sm:grid-cols-3 sm:px-10">
        <div className="flex flex-col items-center gap-2">
          <FiTruck className="h-6 w-6 text-foreground/70" />
          <p className="font-medium">Envíos a todo el mundo</p>
          <p className="max-w-xs text-sm text-foreground/70">Directo a tu puerta, en cualquier parte.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FiPackage className="h-6 w-6 text-foreground/70" />
          <p className="font-medium">Mayoreo</p>
          <p className="max-w-xs text-sm text-foreground/70">Soporte de mayoreo listo para ayudarte.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FaWhatsapp className="h-6 w-6 text-[#25D366]" />
          <p className="font-medium">WhatsApp</p>
          <p className="max-w-xs text-sm text-foreground/70">Contáctanos para más información.</p>
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
}
