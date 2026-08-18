import { prisma } from "@/lib/prisma";

export function getBanners(type: "HERO" | "FLYER" | "BANNER") {
  return prisma.banner.findMany({ where: { type }, orderBy: { order: "asc" } });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoriesWithThumbnail() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { products: { take: 1, include: { variants: { take: 1 } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    thumbnail: c.products[0]?.images[0] ?? c.products[0]?.variants[0]?.imageUrl ?? null,
  }));
}

export async function getProductsWithCover(limit?: number) {
  const products = await prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { variants: { take: 1 }, category: true },
  });
  return products.map((p) => ({
    ...p,
    cover: p.images[0] ?? p.variants[0]?.imageUrl ?? null,
    swatchColor: p.variants[0]?.color ?? null,
  }));
}

export async function getProductsByCategory(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;

  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    orderBy: { createdAt: "desc" },
    include: { variants: { take: 1 } },
  });

  return {
    category,
    products: products.map((p) => ({
      ...p,
      cover: p.variants[0]?.imageUrl ?? null,
      swatchColor: p.variants[0]?.color ?? null,
    })),
  };
}

export async function searchProducts(query: string) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { variants: { take: 1 } },
  });
  return products.map((p) => ({
    ...p,
    cover: p.images[0] ?? p.variants[0]?.imageUrl ?? null,
    swatchColor: p.variants[0]?.color ?? null,
  }));
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true, category: true },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  const [sameCategory, recommended] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId, id: { not: productId } },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { variants: { take: 1 } },
    }),
    prisma.product.findMany({
      where: { id: { not: productId } },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { variants: { take: 1 } },
    }),
  ]);
  const withCover = (p: (typeof sameCategory)[number]) => ({
    ...p,
    cover: p.variants[0]?.imageUrl ?? null,
    swatchColor: p.variants[0]?.color ?? null,
  });
  return { sameCategory: sameCategory.map(withCover), recommended: recommended.map(withCover) };
}
