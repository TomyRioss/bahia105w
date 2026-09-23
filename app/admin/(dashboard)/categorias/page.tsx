import { pbAdmin, type PBCategory, type PBProduct } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCategory } from "@/lib/actions/admin-categories";

export default async function AdminCategoriesPage() {
  const pb = await pbAdmin();
  const categories = await pb.collection("categories").getFullList<PBCategory>({ sort: "name" });
  const products = await pb.collection("products").getFullList<PBProduct>({ fields: "id,category" });
  const countByCat = new Map<string, number>();
  for (const p of products) countByCat.set(p.category, (countByCat.get(p.category) ?? 0) + 1);
  const rows = categories.map((c) => ({ ...c, _count: { products: countByCat.get(c.id) ?? 0 } }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Categorías</h1>
        <CategoryFormDialog trigger={<Button>Nueva categoría</Button>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell className="text-foreground/60">{c.slug}</TableCell>
              <TableCell>{c._count.products}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <CategoryFormDialog
                  category={c}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  }
                />
                <DeleteButton action={deleteCategory.bind(null, c.id)} confirmMessage={`¿Eliminar "${c.name}"?`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
