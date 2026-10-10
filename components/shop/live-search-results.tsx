"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  cover: string | null;
};

export function LiveSearchResults({ query, visible }: { query: string; visible: boolean }) {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = query.trim();
    if (!value) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/product-search?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        if (response.ok) setProducts(await response.json());
      } catch {
        if (!controller.signal.aborted) setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 100);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const open = visible && Boolean(query.trim());

  return (
    <div
      aria-hidden={!open}
      className={`absolute left-0 top-full z-50 w-full overflow-hidden rounded-b-2xl bg-background transition-[max-height,opacity,transform,border-color,box-shadow] duration-300 ease-out sm:w-72 ${
        open
          ? "pointer-events-auto max-h-96 translate-y-0 border-x border-b border-foreground/10 p-3 opacity-100 shadow-2xl"
          : "pointer-events-none max-h-0 -translate-y-1 border-transparent p-0 opacity-0 shadow-none"
      }`}
    >
      <div key={loading ? "loading" : products.length ? "results" : "empty"} className="search-results__content">
        {loading ? (
          <p className="py-5 text-center text-sm text-foreground/60">Buscando prendas...</p>
        ) : products.length ? (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <Link key={product.id} href={`/producto/${product.slug}`} className="group flex min-w-0 items-center gap-3 p-1 text-left hover:bg-cream">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-cream">
                  {product.cover && (
                    <Image
                      src={product.cover}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-foreground">{product.name}</p>
                  <p className="mt-1 text-xs text-cafe">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-5 text-center text-sm text-foreground/60">No encontramos prendas.</p>
        )}
      </div>
    </div>
  );
}
