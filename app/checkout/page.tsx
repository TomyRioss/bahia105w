"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { createOrder } from "@/lib/actions/orders";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const total = cartTotal(items);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const street = String(form.get("street") ?? "");
    const postalCode = String(form.get("postalCode") ?? "");
    const municipality = String(form.get("municipality") ?? "");
    const neighborhood = String(form.get("neighborhood") ?? "");
    try {
      const res = await createOrder({
        contactName: String(form.get("contactName") ?? ""),
        contactEmail: String(form.get("contactEmail") ?? ""),
        contactPhone: String(form.get("contactPhone") ?? ""),
        street,
        postalCode,
        municipality,
        neighborhood,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      clear();
      toast.success("Pedido registrado. Te contactaremos pronto.");
      router.push(`/checkout/gracias?order=${res.orderId}`);
    } catch (err) {
      console.error("[checkout]", err);
      toast.error("No se pudo registrar el pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10">
        <h1 className="font-serif text-3xl">Checkout</h1>

        {items.length === 0 ? (
          <p className="text-sm text-foreground/60">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 p-4 text-sm">
              {items.map((i) => (
                <div key={i.variantId} className="flex justify-between">
                  <span>
                    {i.quantity}x {i.name} ({i.color}, {i.size})
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-foreground/10 pt-2 font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <p className="text-xs text-foreground/50">
              El pago y envío se coordinan directamente por WhatsApp o email tras confirmar tu pedido.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contactName">Nombre completo</Label>
                <Input
                  key={`name-${session?.user?.id ?? "anon"}`}
                  id="contactName"
                  name="contactName"
                  required
                  defaultValue={session?.user?.name ?? ""}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  key={`email-${session?.user?.id ?? "anon"}`}
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  defaultValue={session?.user?.email ?? ""}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input id="contactPhone" name="contactPhone" type="tel" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="street">Calle y número</Label>
                <Input id="street" name="street" required placeholder="Calle y número" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postalCode">Código postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  required
                  inputMode="numeric"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="Código postal"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="municipality">Municipio / poblado</Label>
                <Input id="municipality" name="municipality" required placeholder="Municipio o poblado" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="neighborhood">Colonia</Label>
                <Input id="neighborhood" name="neighborhood" required placeholder="Colonia" />
              </div>

              <Button type="submit" disabled={loading} size="lg" className="rounded-full">
                Confirmar pedido
              </Button>
            </form>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
