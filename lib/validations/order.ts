import { z } from "zod";

export const checkoutSchema = z.object({
  contactName: z.string().min(2, "Nombre muy corto"),
  contactEmail: z.string().email("Email inválido"),
  contactPhone: z.string().min(7, "Teléfono inválido"),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
