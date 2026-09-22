import { z } from "zod";

// acepta URL absoluta o ruta local subida (/uploads/...)
const imageSrc = z
  .string()
  .refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), "URL de imagen invalida");

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  image: imageSrc.optional().or(z.literal("")),
});

export const variantInputSchema = z.object({
  id: z.string().optional(),
  color: z.string(),
  size: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  price: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().positive().optional()),
  imageUrl: imageSrc.optional().or(z.literal("")),
  images: z.array(imageSrc).default([]),
  description: z.string().optional().or(z.literal("")),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  shippingPrice: z.coerce.number().min(0).optional(),
  categoryId: z.string().min(1),
  images: z.array(imageSrc).default([]),
  standardStock: z.coerce.number().int().min(0).optional(),
  standardVariantId: z.string().optional(),
  variants: z.array(variantInputSchema).default([]),
});

export const newAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const bannerSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["HERO", "FLYER", "BANNER"]),
  imageUrl: imageSrc,
  videoUrlDesktop: z.string().url().optional().or(z.literal("")),
  videoUrlMobile: z.string().url().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  link: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
});
