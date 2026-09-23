"use server";

import { revalidatePath } from "next/cache";
import { pbAdmin, type PBOrder, type PBOrderItem } from "@/lib/pocketbase";
import { requireAdmin } from "@/lib/actions/admin-guard";

const STATUSES = ["PENDIENTE", "CONFIRMADO", "COMPLETADO"] as const;

export async function updateOrderStatus(id: string, status: (typeof STATUSES)[number]) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "Estado inválido." };

  try {
    const pb = await pbAdmin();
    const order = await pb.collection("orders").getOne<PBOrder>(id);
    const items = await pb.collection("order_items").getFullList<PBOrderItem>({
      filter: `order="${id}"`,
    });

    // Descontar stock solo en la transición a COMPLETADO, para no descontar dos veces.
    const deducts = status === "COMPLETADO" && order.status !== "COMPLETADO";

    await pb.collection("orders").update(id, { status });
    if (deducts) {
      for (const it of items) {
        const variant = await pb.collection("product_variants").getOne(it.variant as string);
        await pb.collection("product_variants").update(it.variant as string, {
          stock: Math.max(0, (variant.stock as number) - it.quantity),
        });
      }
    }

    revalidatePath("/admin/pedidos");
    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/productos");
    return { ok: true };
  } catch (err) {
    console.error("[updateOrderStatus]", err);
    return { error: "No se pudo actualizar el estado." };
  }
}
