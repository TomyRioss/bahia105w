"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/admin-guard";

const STATUSES = ["PENDIENTE", "CONFIRMADO", "COMPLETADO"] as const;

export async function updateOrderStatus(id: string, status: (typeof STATUSES)[number]) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "Estado inválido." };

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true, items: { select: { productVariantId: true, quantity: true } } },
    });
    if (!order) return { error: "Pedido no encontrado." };

    // Descontar stock solo en la transición a COMPLETADO, para no descontar dos veces.
    const deducts = status === "COMPLETADO" && order.status !== "COMPLETADO";

    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status } }),
      ...(deducts
        ? order.items.map((it) =>
            prisma.productVariant.update({
              where: { id: it.productVariantId },
              data: { stock: { decrement: it.quantity } },
            })
          )
        : []),
    ]);

    revalidatePath("/admin/pedidos");
    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/productos");
    return { ok: true };
  } catch (err) {
    console.error("[updateOrderStatus]", err);
    return { error: "No se pudo actualizar el estado." };
  }
}
