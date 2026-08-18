"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatPrice } from "@/lib/format";

type MarqueeProduct = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  cover: string | null;
};

export function ProductMarquee({ products }: { products: MarqueeProduct[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" }, [
    Autoplay({ delay: 3200, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      emblaApi?.plugins().autoplay?.stop();
    }
  }, [emblaApi]);

  if (products.length === 0) return null;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-6 sm:px-20">
      <button
        type="button"
        aria-label="Anterior"
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-foreground/20 bg-background p-2 text-foreground shadow-sm hover:bg-cream sm:flex"
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={scrollNext}
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-foreground/20 bg-background p-2 text-foreground shadow-sm hover:bg-cream sm:flex"
      >
        <FiChevronRight className="h-5 w-5" />
      </button>

      <div ref={emblaRef} className="cursor-grab overflow-hidden active:cursor-grabbing">
        <div className="flex gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              draggable={false}
              className="group/item flex w-[60vw] shrink-0 flex-col gap-3 sm:w-[calc((100%-3rem)/4)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream">
                {p.cover && (
                  <Image
                    src={p.cover}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item:scale-105"
                    sizes="(max-width: 640px) 60vw, 25vw"
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm">{formatPrice(p.price)}</p>
                <p className="text-sm text-foreground/70">{p.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
