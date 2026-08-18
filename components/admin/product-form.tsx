"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveProduct } from "@/lib/actions/admin-products";

type Variant = {
  id?: string;
  color: string;
  size: string;
  stock: number;
  imageUrl: string;
  images: string[];
  description: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  images: string[];
  variants: Variant[];
};

function linesToUrls(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants ?? [{ color: "", size: "", stock: 0, imageUrl: "", images: [], description: "" }]
  );

  function updateVariant(index: number, patch: Partial<Variant>) {
    setVariants((vs) => vs.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((vs) => [...vs, { color: "", size: "", stock: 0, imageUrl: "", images: [], description: "" }]);
  }

  function removeVariant(index: number) {
    setVariants((vs) => vs.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await saveProduct({
      id: product?.id,
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      price: form.get("price"),
      categoryId,
      images: linesToUrls(String(form.get("images") ?? "")),
      variants,
    });

    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Producto guardado.");
    router.push("/admin/productos");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="vestido-negro" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Precio (MXN)</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí categoría">
                {() => categories.find((c) => c.id === categoryId)?.name ?? "Elegí categoría"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción (incluir material)</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={product?.description} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="images">Galería del producto (una URL de imagen por línea)</Label>
        <Textarea
          id="images"
          name="images"
          rows={3}
          defaultValue={product?.images.join("\n")}
          placeholder={"https://...jpg\nhttps://...jpg"}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Variantes (color, talla, stock, imagen principal, galería y descripción propias)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1">
            <FiPlus className="h-3.5 w-3.5" /> Agregar variante
          </Button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-foreground/10 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              <Input
                placeholder="Color"
                value={v.color}
                onChange={(e) => updateVariant(i, { color: e.target.value })}
                required
              />
              <Input
                placeholder="Talla"
                value={v.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                required
              />
              <Input
                placeholder="URL imagen principal"
                value={v.imageUrl}
                onChange={(e) => updateVariant(i, { imageUrl: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(i)}
                disabled={variants.length === 1}
              >
                <FiTrash2 className="h-4 w-4 text-rosa" />
              </Button>
            </div>
            <Textarea
              placeholder={"Galería de esta variante: una URL por línea"}
              rows={2}
              value={v.images.join("\n")}
              onChange={(e) => updateVariant(i, { images: linesToUrls(e.target.value) })}
            />
            <Textarea
              placeholder="Descripción propia de esta variante (opcional, si no se usa la del producto)"
              rows={2}
              value={v.description}
              onChange={(e) => updateVariant(i, { description: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading} size="lg" className="w-fit">
        Guardar producto
      </Button>
    </form>
  );
}
