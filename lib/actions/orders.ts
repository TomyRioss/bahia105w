"use server";

import { auth } from "@/auth";
import { pbAdmin, esc, type PBVariant } from "@/lib/pocketbase";
import { sendNewOrderEmail } from "@/lib/email";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/order";

export async function createOrder(input: CheckoutInput) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { contactName, contactEmail, contactPhone, contactAddress, items } = parsed.data;

  const session = await auth();

  try {
    const pb = await pbAdmin();
    const filter = items.map((i) => `id="${esc(i.variantId)}"`).join("||");
    const variants = await pb.collection("product_variants").getFullList<PBVariant>({
      filter: filter || 'id=""',
      expand: "product",
    });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) return { error: "Uno de los productos ya no está disponible." };
      if (variant.stock < item.quantity) {
        const name = (variant.expand?.product as { name?: string } | undefined)?.name ?? "El producto";
        return {
          error:
            variant.stock === 0
              ? `${name} está sin stock.`
              : `Solo quedan ${variant.stock} unidades de ${name}.`,
        };
      }
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await pb.collection("orders").create({
      user: session?.user?.id || null,
      contactName, contactEmail, contactPhone, contactAddress,
      status: "PENDIENTE", total,
    });

    for (const i of items) {
      await pb.collection("order_items").create({
        order: order.id, variant: i.variantId, quantity: i.quantity, price: i.price,
      });
    }

    await sendNewOrderEmail({ id: order.id, contactName, contactEmail, contactPhone, contactAddress, total });

    return { orderId: order.id };
  } catch (err) {
    console.error("[createOrder]", err);
    return { error: "No se pudo registrar el pedido. Intentá de nuevo." };
  }
}
