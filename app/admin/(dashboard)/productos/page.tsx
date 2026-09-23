import Link from "next/link";
import { pbAdmin, type PBProduct, type PBVariant } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductRow } from "@/components/admin/product-row";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const pb = await pbAdmin();
  const products = await pb.collection("products").getFullList<PBProduct>({
    sort: "-created",
    expand: "category",
  });
  const variants = await pb.collection("product_variants").getFullList<PBVariant>({ sort: "color,size" });
  const byProduct = new Map<string, PBVariant[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.product) ?? [];
    arr.push(v);
    byProduct.set(v.product, arr);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>Nuevo producto</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Variantes</TableHead>
            <TableHead>Stock total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const vs = byProduct.get(p.id) ?? [];
            return (
              <ProductRow
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  categoryName: (p.expand?.category as { name?: string } | undefined)?.name ?? "",
                  price: formatPrice(p.price.toString()),
                  cover: (p.images ?? [])[0] ?? vs.find((v) => v.imageUrl)?.imageUrl ?? null,
                  variants: vs.map((v) => ({
                    id: v.id,
                    color: v.color,
                    size: v.size,
                    stock: v.stock,
                  })),
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
