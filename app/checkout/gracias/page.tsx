import Link from "next/link";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-4 px-6 py-24 text-center sm:px-10">
        <h1 className="font-serif text-3xl">¡Gracias por tu pedido!</h1>
        {order && <p className="text-sm text-foreground/60">Pedido #{order.slice(-8)}</p>}
        <p className="max-w-md text-sm text-foreground/70">
          Te contactaremos por WhatsApp o email para coordinar el pago y envío.
        </p>
        <Link href="/" className="mt-4 rounded-full bg-foreground px-8 py-3 text-sm text-background">
          Volver a la tienda
        </Link>
      </section>
      <SiteFooter />
    </div>
  );
}
