import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pbAdmin, esc, type PBOrder, type PBOrderItem, type PBVariant } from "@/lib/pocketbase";
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

  const pb = await pbAdmin();
  const orders = await pb.collection("orders").getFullList<PBOrder>({
    filter: `user="${esc(session.user.id)}"`,
    sort: "-created",
  });
  const itemsByOrder = new Map<string, PBOrderItem[]>();
  if (orders.length > 0) {
    const items = await pb.collection("order_items").getFullList<PBOrderItem>({
      filter: orders.map((o) => `order="${esc(o.id)}"`).join("||"),
    });
    for (const it of items) {
      const arr = itemsByOrder.get(it.order) ?? [];
      arr.push(it);
      itemsByOrder.set(it.order, arr);
    }
  }
  const variantIds = [...new Set([...itemsByOrder.values()].flat().map((it) => it.variant))];
  const variantMap = new Map<string, { color: string; size: string; productName: string }>();
  if (variantIds.length > 0) {
    const variants = await pb.collection("product_variants").getFullList<PBVariant>({
      filter: variantIds.map((id) => `id="${esc(id)}"`).join("||"),
      expand: "product",
    });
    for (const v of variants) {
      variantMap.set(v.id, {
        color: v.color,
        size: v.size,
        productName: (v.expand?.product as { name?: string } | undefined)?.name ?? "Producto",
      });
    }
  }

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
                  {new Date(o.created).toLocaleDateString("es-MX", { dateStyle: "long" })}
                </p>
                <ul className="flex flex-col gap-1 text-sm text-foreground/70">
                  {(itemsByOrder.get(o.id) ?? []).map((it) => {
                    const v = variantMap.get(it.variant);
                    return (
                      <li key={it.id}>
                        {it.quantity}x {v?.productName ?? "Producto"} ({v?.color},{" "}
                        {v?.size})
                      </li>
                    );
                  })}
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
