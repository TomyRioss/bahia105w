"use client";

import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const total = cartTotal(items);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <p className="text-sm text-foreground/60">Tu carrito está vacío.</p>
            <SheetClose
              nativeButton={false}
              render={
                <Link href="/" className="rounded-full bg-foreground px-6 py-2 text-sm text-background">
                  Seguir comprando
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-4 border-b border-foreground/10 pb-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-cream">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-foreground/60">
                      {item.color} · {item.size}
                    </p>
                    <p className="text-sm text-cafe">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                      className="rounded-full border border-foreground/20 p-1.5 hover:bg-foreground/5"
                      aria-label="Reducir cantidad"
                    >
                      <FiMinus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="rounded-full border border-foreground/20 p-1.5 hover:bg-foreground/5 disabled:opacity-40"
                      aria-label="Aumentar cantidad"
                    >
                      <FiPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.variantId)}
                    className="text-foreground/40 hover:text-rosa"
                    aria-label="Eliminar"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <SheetFooter>
              <div className="flex items-center justify-between text-lg">
                <p className="font-medium">Total</p>
                <p className="font-medium">{formatPrice(total)}</p>
              </div>
              <SheetClose
                nativeButton={false}
                render={
                  <Link href="/checkout">
                    <Button className="w-full rounded-full" size="lg">
                      Continuar al checkout
                    </Button>
                  </Link>
                }
              />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
