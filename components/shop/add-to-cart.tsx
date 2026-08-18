"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

type Variant = {
  id: string;
  color: string;
  size: string;
  imageUrl: string | null;
  images?: string[];
  description?: string | null;
};

export function AddToCart({
  productSlug,
  productName,
  price,
  variants,
  onVariantChange,
}: {
  productSlug: string;
  productName: string;
  price: number;
  variants: Variant[];
  onVariantChange?: (variant: Variant | undefined) => void;
}) {
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const [color, setColor] = useState(colors[0] ?? "");
  const sizes = useMemo(() => variants.filter((v) => v.color === color), [variants, color]);
  const [size, setSize] = useState(sizes[0]?.size ?? "");

  const add = useCartStore((s) => s.add);

  const selected = variants.find((v) => v.color === color && v.size === size);

  useEffect(() => {
    onVariantChange?.(selected ?? variants.find((v) => v.color === color));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, color]);

  function handleAdd() {
    if (!selected) {
      toast.error("Elegí color y talla.");
      return;
    }
    add({
      variantId: selected.id,
      productSlug,
      name: productName,
      price,
      color: selected.color,
      size: selected.size,
      imageUrl: selected.imageUrl,
    });
    toast.success("Agregado al carrito.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Color</p>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setSize(variants.find((v) => v.color === c)?.size ?? "");
              }}
              className={`rounded-full border px-4 py-2 text-sm ${
                c === color ? "border-foreground bg-foreground text-background" : "border-foreground/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Talla</p>
        <div className="flex gap-2">
          {sizes.map((v) => (
            <button
              key={v.id}
              onClick={() => setSize(v.size)}
              className={`rounded-full border px-4 py-2 text-sm ${
                v.size === size ? "border-foreground bg-foreground text-background" : "border-foreground/20"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleAdd} className="mt-2 rounded-full" size="lg">
        Agregar al carrito
      </Button>
    </div>
  );
}
