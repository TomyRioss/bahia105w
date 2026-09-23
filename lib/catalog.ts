import { pbAdmin, esc, type PBCategory, type PBProduct, type PBVariant, type PBBanner } from "@/lib/pocketbase";

// Capa de compatibilidad: devuelve objetos con la misma forma que Prisma
// para no tocar las páginas. createdAt como Date, categoryId/productId,
// prices como number (aceptan .toString()).

export interface CategoryRow extends Omit<PBCategory, "created"> {
  createdAt: Date;
}

export interface VariantRow extends Omit<PBVariant, "product"> {
  productId: string;
}

export interface ProductRow extends Omit<PBProduct, "created" | "category" | "images"> {
  images: string[];
  categoryId: string;
  createdAt: Date;
  category?: CategoryRow;
  variants: VariantRow[];
}

export function toCategory(c: PBCategory): CategoryRow {
  return { ...c, createdAt: new Date(c.created) };
}

export function toVariant(v: PBVariant): VariantRow {
  const { product, ...rest } = v;
  return { ...rest, productId: product, images: v.images ?? [] };
}

export function toProduct(
  p: PBProduct,
  variants: PBVariant[] = [],
  category?: PBCategory,
): ProductRow {
  const { category: catId, created, ...rest } = p;
  return {
    ...rest,
    images: p.images ?? [],
    categoryId: catId,
    createdAt: new Date(created),
    category: category ? toCategory(category) : undefined,
    variants: variants.map(toVariant),
  };
}

async function variantsFor(productIds: string[]) {
  if (productIds.length === 0) return [] as PBVariant[];
  const pb = await pbAdmin();
  const filter = productIds.map((id) => `product="${esc(id)}"`).join("||");
  return pb.collection("product_variants").getFullList<PBVariant>({ filter, sort: "color" });
}

function firstByColorDesc(variants: PBVariant[]) {
  const sorted = [...variants].sort((a, b) => (b.color ?? "").localeCompare(a.color ?? ""));
  return sorted.slice(0, 1);
}

export async function getBanners(type: "HERO" | "FLYER" | "BANNER") {
  const pb = await pbAdmin();
  const banners = await pb.collection("banners").getFullList<PBBanner>({
    filter: `type="${type}"`,
    sort: "order,created",
  });
  return banners.map((b) => ({ ...b, createdAt: new Date(b.created) }));
}

export async function getCategories() {
  const pb = await pbAdmin();
  const cats = await pb.collection("categories").getFullList<PBCategory>({ sort: "name" });
  return cats.map(toCategory);
}

export async function getCategoriesWithThumbnail() {
  const categories = await getCategories();
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    thumbnail: c.image ?? null,
  }));
}

export async function getProductsWithCover(limit?: number) {
  const pb = await pbAdmin();
  const products = await pb
    .collection("products")
    .getList<PBProduct>(1, limit ?? 100, { sort: "-created", expand: "category" });
  const variants = await variantsFor(products.items.map((p) => p.id));
  const byProduct = new Map<string, PBVariant[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.product) ?? [];
    arr.push(v);
    byProduct.set(v.product, arr);
  }
  return products.items.map((p) => {
    const vs = firstByColorDesc(byProduct.get(p.id) ?? []);
    const row = toProduct(p, vs, p.expand?.category as PBCategory | undefined);
    return {
      ...row,
      cover: row.images[0] ?? vs[0]?.imageUrl ?? null,
      swatchColor: vs[0]?.color ?? null,
    };
  });
}

export async function getProductsByCategory(slug: string) {
  const pb = await pbAdmin();
  let category: PBCategory;
  try {
    category = await pb.collection("categories").getFirstListItem<PBCategory>(`slug="${esc(slug)}"`);
  } catch {
    return null;
  }
  const products = await pb.collection("products").getFullList<PBProduct>({
    filter: `category="${category.id}"`,
    sort: "-created",
  });
  const variants = await variantsFor(products.map((p) => p.id));
  const byProduct = new Map<string, PBVariant[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.product) ?? [];
    arr.push(v);
    byProduct.set(v.product, arr);
  }
  return {
    category: toCategory(category),
    products: products.map((p) => {
      const vs = firstByColorDesc(byProduct.get(p.id) ?? []);
      const row = toProduct(p, vs);
      return {
        ...row,
        cover: row.images[0] ?? vs[0]?.imageUrl ?? null,
        hoverImage: row.images[1] ?? vs[0]?.imageUrl ?? null,
        swatchColor: vs[0]?.color ?? null,
      };
    }),
  };
}

export async function searchProducts(query: string) {
  const pb = await pbAdmin();
  const q = esc(query);
  const products = await pb.collection("products").getFullList<PBProduct>({
    filter: `name~"${q}"||description~"${q}"`,
    sort: "-created",
  });
  const variants = await variantsFor(products.map((p) => p.id));
  const byProduct = new Map<string, PBVariant[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.product) ?? [];
    arr.push(v);
    byProduct.set(v.product, arr);
  }
  return products.map((p) => {
    const vs = firstByColorDesc(byProduct.get(p.id) ?? []);
    const row = toProduct(p, vs);
    return {
      ...row,
      cover: row.images[0] ?? vs[0]?.imageUrl ?? null,
      swatchColor: vs[0]?.color ?? null,
    };
  });
}

export async function getProductBySlug(slug: string) {
  const pb = await pbAdmin();
  let product: PBProduct;
  try {
    product = await pb
      .collection("products")
      .getFirstListItem<PBProduct>(`slug="${esc(slug)}"`, { expand: "category" });
  } catch {
    return null;
  }
  const variants = await pb.collection("product_variants").getFullList<PBVariant>({
    filter: `product="${product.id}"`,
    sort: "color",
  });
  return toProduct(product, variants, product.expand?.category as PBCategory | undefined);
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  const pb = await pbAdmin();
  const [sameCategory, recommended] = await Promise.all([
    pb.collection("products").getList<PBProduct>(1, 4, {
      filter: `category="${esc(categoryId)}"&&id!="${esc(productId)}"`,
      sort: "-created",
    }),
    pb.collection("products").getList<PBProduct>(1, 4, {
      filter: `id!="${esc(productId)}"`,
      sort: "-created",
    }),
  ]);
  const all = [...sameCategory.items, ...recommended.items];
  const variants = await variantsFor(all.map((p) => p.id));
  const byProduct = new Map<string, PBVariant[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.product) ?? [];
    arr.push(v);
    byProduct.set(v.product, arr);
  }
  const withCover = (p: PBProduct) => {
    const vs = firstByColorDesc(byProduct.get(p.id) ?? []);
    const row = toProduct(p, vs);
    return {
      ...row,
      cover: row.images[0] ?? vs[0]?.imageUrl ?? null,
      hoverImage: row.images[1] ?? vs[0]?.imageUrl ?? null,
      swatchColor: vs[0]?.color ?? null,
    };
  };
  return {
    sameCategory: sameCategory.items.map(withCover),
    recommended: recommended.items.map(withCover),
  };
}
