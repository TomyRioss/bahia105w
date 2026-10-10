import { searchProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) return Response.json([]);

  const products = await searchProducts(query, 4);
  return Response.json(
    products.map(({ id, slug, name, price, cover }) => ({ id, slug, name, price, cover })),
  );
}
