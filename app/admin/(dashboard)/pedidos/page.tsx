import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatPrice } from "@/lib/format";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { productVariant: { include: { product: true } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl">Pedidos</h1>

      <div className="flex flex-col gap-4">
        {orders.length === 0 && <p className="text-sm text-foreground/60">Todavía no hay pedidos.</p>}
        {orders.map((o) => (
          <div key={o.id} className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Pedido #{o.id.slice(-8)}</p>
                <p className="text-xs text-foreground/50">
                  {new Date(o.createdAt).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}
                </p>
              </div>
              <OrderStatusSelect orderId={o.id} status={o.status} />
            </div>

            <div className="grid grid-cols-1 gap-1 text-sm text-foreground/70 sm:grid-cols-3">
              <p>
                <span className="font-medium text-foreground">Contacto:</span> {o.contactName}
              </p>
              <p>
                <span className="font-medium text-foreground">Email:</span> {o.contactEmail}
              </p>
              <p>
                <span className="font-medium text-foreground">Teléfono:</span> {o.contactPhone}
              </p>
            </div>

            <ul className="flex flex-col gap-1 text-sm text-foreground/70">
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.quantity}x {it.productVariant.product.name} ({it.productVariant.color}, {it.productVariant.size})
                  {" — "}
                  {formatPrice(it.price.toString())}
                </li>
              ))}
            </ul>

            <p className="text-sm font-medium">Total: {formatPrice(o.total.toString())}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
