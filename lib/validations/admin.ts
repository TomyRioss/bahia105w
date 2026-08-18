import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
});

export const variantInputSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1),
  size: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).default([]),
  description: z.string().optional().or(z.literal("")),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  variants: z.array(variantInputSchema).min(1, "Agregá al menos una variante"),
});

export const newAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const bannerSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["HERO", "FLYER", "BANNER"]),
  imageUrl: z.string().url(),
  title: z.string().optional().or(z.literal("")),
  link: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
});
