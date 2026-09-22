import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductRow } from "@/components/admin/product-row";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
  });

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
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                categoryName: p.category.name,
                price: formatPrice(p.price.toString()),
                cover: p.images[0] ?? p.variants.find((v) => v.imageUrl)?.imageUrl ?? null,
                variants: p.variants.map((v) => ({
                  id: v.id,
                  color: v.color,
                  size: v.size,
                  stock: v.stock,
                })),
              }}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
