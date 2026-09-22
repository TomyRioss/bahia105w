"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct, updateVariantStock } from "@/lib/actions/admin-products";

type Variant = { id: string; color: string; size: string; stock: number };

export type AdminProduct = {
  id: string;
  name: string;
  categoryName: string;
  price: string;
  cover: string | null;
  variants: Variant[];
};

function variantLabel(v: Variant) {
  if (!v.color) return `Estándar · ${v.size}`;
  return `${v.color} · ${v.size}`;
}

function StockField({ variant }: { variant: Variant }) {
  const [value, setValue] = useState(String(variant.stock));
  const [pending, startTransition] = useTransition();

  function save() {
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Ingresá un número entero mayor o igual a 0.");
      setValue(String(variant.stock));
      return;
    }
    if (stock === variant.stock) return;

    startTransition(async () => {
      try {
        const res = await updateVariantStock(variant.id, stock);
        if (res.error) {
          toast.error(res.error);
          setValue(String(variant.stock));
          return;
        }
        toast.success("Stock actualizado.");
      } catch (err) {
        console.error("[product-row] updateVariantStock", err);
        toast.error("No se pudo actualizar el stock.");
        setValue(String(variant.stock));
      }
    });
  }

  return (
    <Input
      type="number"
      min="0"
      step="1"
      inputMode="numeric"
      value={value}
      disabled={pending}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="h-8 w-24"
      aria-label={`Stock de ${variantLabel(variant)}`}
    />
  );
}

export function ProductRow({ product }: { product: AdminProduct }) {
  const [open, setOpen] = useState(false);
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <>
      <TableRow>
        <TableCell>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Colapsar variantes" : "Expandir variantes"}
            className="rounded-md p-1 text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
          >
            {open ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
          </button>
        </TableCell>
        <TableCell>
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-cream">
            {product.cover && (
              <Image src={product.cover} alt={product.name} fill className="object-cover" sizes="40px" />
            )}
          </div>
        </TableCell>
        <TableCell>{product.name}</TableCell>
        <TableCell className="text-foreground/60">{product.categoryName}</TableCell>
        <TableCell>{product.price}</TableCell>
        <TableCell>{product.variants.length}</TableCell>
        <TableCell className={totalStock === 0 ? "text-rosa" : undefined}>
          {totalStock === 0 ? "Sin stock" : totalStock}
        </TableCell>
        <TableCell className="flex justify-end gap-1">
          <Link href={`/admin/productos/${product.id}/editar`}>
            <Button variant="ghost" size="sm">
              Editar
            </Button>
          </Link>
          <DeleteButton
            action={deleteProduct.bind(null, product.id)}
            confirmMessage={`¿Eliminar "${product.name}"?`}
          />
        </TableCell>
      </TableRow>

      {open && (
        <TableRow className="bg-foreground/[0.02] hover:bg-foreground/[0.02]">
          <TableCell colSpan={8} className="p-0">
            <div className="flex flex-col gap-2 px-4 py-4 sm:px-14">
              {product.variants.length === 0 && (
                <p className="text-sm text-foreground/60">Este producto no tiene variantes.</p>
              )}
              {product.variants.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col gap-2 rounded-md border border-foreground/10 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm">
                    {variantLabel(v)}
                    {v.stock === 0 && <span className="ml-2 text-xs text-rosa">SIN STOCK</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/55">Stock</span>
                    <StockField variant={v} />
                  </div>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
