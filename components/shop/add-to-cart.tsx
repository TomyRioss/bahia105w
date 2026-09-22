"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

type Variant = {
  id: string;
  color: string;
  size: string;
  stock: number;
  price: string | null;
  imageUrl: string | null;
  images?: string[];
  description?: string | null;
};

export function AddToCart({
  productSlug,
  productName,
  price,
  variants,
  fallbackImage,
  onVariantChange,
}: {
  productSlug: string;
  productName: string;
  price: number;
  variants: Variant[];
  fallbackImage?: string;
  onVariantChange?: (variant: Variant | undefined) => void;
}) {
  const isStandard = variants.length === 1 && variants[0].color === "";

  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const [color, setColor] = useState(colors[0] ?? "");
  const sizes = useMemo(() => variants.filter((v) => v.color === color), [variants, color]);
  const [size, setSize] = useState(sizes[0]?.size ?? "");

  const add = useCartStore((s) => s.add);
  const items = useCartStore((s) => s.items);
  const [desiredQuantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = isStandard ? variants[0] : variants.find((v) => v.color === color && v.size === size);

  useEffect(() => {
    onVariantChange?.(selected ?? variants.find((v) => v.color === color));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, color]);

  const inCart = items.find((i) => i.variantId === selected?.id)?.quantity ?? 0;
  const stock = selected?.stock ?? 0;
  const available = Math.max(stock - inCart, 0);
  const outOfStock = stock <= 0;

  // Cantidad derivada: si el stock disponible baja, se recorta sola sin efectos.
  const quantity = Math.min(Math.max(desiredQuantity, 1), Math.max(available, 1));

  function handleAdd() {
    if (!selected) {
      toast.error("Elegí color y talla.");
      return;
    }
    if (available < quantity) {
      toast.error(
        available === 0 ? "No queda stock disponible." : `Solo quedan ${available} unidades disponibles.`
      );
      return;
    }
    add({
      variantId: selected.id,
      productSlug,
      name: productName,
      price: selected.price ? Number(selected.price) : price,
      color: selected.color,
      size: selected.size,
      imageUrl: selected.images?.[0] ?? selected.imageUrl ?? fallbackImage ?? null,
      stock: selected.stock,
    }, quantity);
    setAdded(true);
  }

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <div className="flex flex-col gap-4">
      {!isStandard && (
        <>
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
                  {c || "Estándar"}
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
        </>
      )}

      {!outOfStock && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Cantidad</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                disabled={quantity <= 1}
                className="rounded-full border border-foreground/20 p-2 disabled:opacity-40"
                aria-label="Reducir cantidad"
              >
                <FiMinus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(q + 1, available))}
                disabled={quantity >= available}
                className="rounded-full border border-foreground/20 p-2 disabled:opacity-40"
                aria-label="Aumentar cantidad"
              >
                <FiPlus className="h-3.5 w-3.5" />
              </button>
            </div>
            {available === 0 && (
              <p className="text-xs text-foreground/55">Ya agregaste todo el stock al carrito</p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={handleAdd}
        disabled={outOfStock || available === 0}
        className={`mt-2 rounded-full disabled:bg-foreground/20 disabled:text-foreground/50 ${
          added ? "bg-rosa text-rosa-foreground hover:bg-rosa" : ""
        }`}
        size="lg"
      >
        {outOfStock ? (
          "SIN STOCK"
        ) : added ? (
          <span className="flex items-center gap-2">
            <FiCheck className="h-4 w-4" />
            Añadido
          </span>
        ) : (
          "Agregar al carrito"
        )}
      </Button>
    </div>
  );
}
