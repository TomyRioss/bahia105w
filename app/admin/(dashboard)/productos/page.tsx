import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct } from "@/lib/actions/admin-products";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
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
            const cover = p.variants.find((v) => v.imageUrl)?.imageUrl;
            return (
            <TableRow key={p.id}>
              <TableCell>
                <div className="relative h-10 w-10 overflow-hidden rounded-md bg-cream">
                  {cover && <Image src={cover} alt={p.name} fill className="object-cover" sizes="40px" />}
                </div>
              </TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell className="text-foreground/60">{p.category.name}</TableCell>
              <TableCell>{formatPrice(p.price.toString())}</TableCell>
              <TableCell>{p.variants.length}</TableCell>
              <TableCell>{p.variants.reduce((sum, v) => sum + v.stock, 0)}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <Link href={`/admin/productos/${p.id}/editar`}>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </Link>
                <DeleteButton action={deleteProduct.bind(null, p.id)} confirmMessage={`¿Eliminar "${p.name}"?`} />
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
