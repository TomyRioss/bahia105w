import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  PENDIENTE: "bg-amber-500",
  CONFIRMADO: "bg-sky-500",
  COMPLETADO: "bg-emerald-600",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-foreground/45">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

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

        {orders.map((o) => {
          const units = o.items.reduce((acc, it) => acc + it.quantity, 0);

          return (
            <article
              key={o.id}
              className="overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-sm transition-shadow hover:shadow-md"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 bg-foreground/[0.02] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[o.status] ?? "bg-foreground/30")} />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium tabular-nums">Pedido #{o.id.slice(-8)}</p>
                    <p className="text-xs text-foreground/50">
                      {new Date(o.createdAt).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </header>

              <div className="grid gap-x-8 gap-y-6 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <dl className="flex flex-col gap-4">
                  <Field label="Contacto">{o.contactName}</Field>
                  <Field label="Email">
                    <a href={`mailto:${o.contactEmail}`} className="underline-offset-4 hover:underline">
                      {o.contactEmail}
                    </a>
                  </Field>
                  <Field label="Teléfono">
                    <a href={`tel:${o.contactPhone}`} className="tabular-nums underline-offset-4 hover:underline">
                      {o.contactPhone}
                    </a>
                  </Field>
                  <Field label="Dirección">
                    <span className="block max-w-[60ch] text-pretty leading-relaxed">
                      {o.contactAddress || <span className="text-foreground/40">Sin dirección</span>}
                    </span>
                  </Field>
                </dl>

                <ul className="flex flex-col divide-y divide-foreground/5 border-t border-foreground/5 md:border-t-0">
                  {o.items.map((it) => {
                    const variant = [it.productVariant.color, it.productVariant.size].filter(Boolean).join(" · ");
                    const lineTotal = Number(it.price) * it.quantity;

                    return (
                      <li key={it.id} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 shrink-0 rounded bg-foreground/5 px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground/70">
                            {it.quantity}x
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm">{it.productVariant.product.name}</p>
                            {variant && <p className="text-xs text-foreground/50">{variant}</p>}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm tabular-nums">{formatPrice(lineTotal)}</p>
                          {it.quantity > 1 && (
                            <p className="text-xs tabular-nums text-foreground/50">
                              {formatPrice(it.price.toString())} c/u
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 px-5 py-3">
                <p className="text-xs text-foreground/50">
                  {units} {units === 1 ? "artículo" : "artículos"}
                </p>
                <p className="text-sm font-medium tabular-nums">Total: {formatPrice(o.total.toString())}</p>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
