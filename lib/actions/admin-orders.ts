"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/actions/admin-guard";

const STATUSES = ["PENDIENTE", "CONFIRMADO", "COMPLETADO"] as const;

export async function updateOrderStatus(id: string, status: (typeof STATUSES)[number]) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "Estado inválido." };

  try {
    await prisma.order.update({ where: { id }, data: { status } });
    revalidatePath("/admin/pedidos");
    revalidatePath("/cuenta/pedidos");
    return { ok: true };
  } catch (err) {
    console.error("[updateOrderStatus]", err);
    return { error: "No se pudo actualizar el estado." };
  }
}
