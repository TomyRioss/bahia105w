import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { productVariant: { include: { product: true } } } } },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-8 px-6 py-16 sm:px-10">
        <h1 className="font-serif text-3xl">Mis pedidos</h1>
        {orders.length === 0 ? (
          <p className="text-sm text-foreground/60">Todavía no hiciste ningún pedido.</p>
        ) : (
          <div className="flex w-full max-w-3xl flex-col gap-4">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Pedido #{o.id.slice(-8)}</p>
                  <Badge variant="secondary">{STATUS_LABEL[o.status]}</Badge>
                </div>
                <p className="text-xs text-foreground/50">
                  {new Date(o.createdAt).toLocaleDateString("es-MX", { dateStyle: "long" })}
                </p>
                <ul className="flex flex-col gap-1 text-sm text-foreground/70">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {it.quantity}x {it.productVariant.product.name} ({it.productVariant.color},{" "}
                      {it.productVariant.size})
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-medium">Total: {formatPrice(o.total.toString())}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
