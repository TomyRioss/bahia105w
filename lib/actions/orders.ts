"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map((i) => i.variantId) } },
      select: { id: true, stock: true, product: { select: { name: true } } },
    });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) return { error: "Uno de los productos ya no está disponible." };
      if (variant.stock < item.quantity) {
        return {
          error:
            variant.stock === 0
              ? `${variant.product.name} está sin stock.`
              : `Solo quedan ${variant.stock} unidades de ${variant.product.name}.`,
        };
      }
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        contactName,
        contactEmail,
        contactPhone,
        contactAddress,
        total,
        items: {
          create: items.map((i) => ({
            productVariantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    });

    await sendNewOrderEmail({ id: order.id, contactName, contactEmail, contactPhone, contactAddress, total });

    return { orderId: order.id };
  } catch (err) {
    console.error("[createOrder]", err);
    return { error: "No se pudo registrar el pedido. Intentá de nuevo." };
  }
}
