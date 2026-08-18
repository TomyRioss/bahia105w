"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCart } from "@/components/shop/add-to-cart";
import { FavoriteButton } from "@/components/shop/favorite-button";
import { formatPrice } from "@/lib/format";

type Variant = {
  id: string;
  color: string;
  size: string;
  imageUrl: string | null;
  images: string[];
  description: string | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  images: string[];
  category: { name: string };
  variants: Variant[];
};

export function ProductView({ product }: { product: Product }) {
  const [activeVariant, setActiveVariant] = useState<Variant | undefined>(product.variants[0]);

  const gallery =
    activeVariant && activeVariant.images.length > 0
      ? activeVariant.images
      : activeVariant?.imageUrl
        ? [activeVariant.imageUrl]
        : product.images.length > 0
          ? product.images
          : product.variants[0]?.imageUrl
            ? [product.variants[0].imageUrl]
            : [];

  const description = activeVariant?.description || product.description;

  return (
    <section className="grid grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-[3fr_2fr] sm:px-10">
      <ProductGallery images={gallery} alt={product.name} />

      <div className="flex w-full max-w-lg flex-col justify-center gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">{product.category.name}</p>
          <h1 className="font-serif text-3xl">{product.name}</h1>
          <p className="mt-2 text-xl text-cafe">{formatPrice(product.price)}</p>
        </div>

        <AddToCart
          productSlug={product.slug}
          productName={product.name}
          price={Number(product.price)}
          variants={product.variants}
          onVariantChange={(v) => setActiveVariant(v as Variant | undefined)}
        />

        <FavoriteButton productId={product.id} />

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/70">{description}</p>
      </div>
    </section>
  );
}
