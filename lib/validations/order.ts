import { z } from "zod";

export const checkoutSchema = z.object({
  contactName: z.string().min(2, "Nombre muy corto"),
  contactEmail: z.string().email("Email inválido"),
  contactPhone: z.string().min(7, "Teléfono inválido"),
  contactAddress: z.string().optional(),
  street: z.string().min(3, "Calle y numero invalida"),
  postalCode: z.string().regex(/^\d{5}$/, "Codigo postal invalido"),
  municipality: z.string().min(2, "Municipio o poblado invalido"),
  neighborhood: z.string().min(2, "Colonia invalida"),
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
