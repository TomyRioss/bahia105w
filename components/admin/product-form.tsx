"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiMove, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/admin/media-uploader";
import { SortableItem, SortableList, arrayMove } from "@/components/admin/sortable-list";
import { saveProduct, uploadProductFiles } from "@/lib/actions/admin-products";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

type Variant = {
  uid?: string;
  id?: string;
  color: string;
  size: string;
  stock: number;
  price: string;
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
  shippingPrice: string | null;
  categoryId: string;
  images: string[];
  variants: Variant[];
};

// uid: clave estable para el reordenamiento; el schema del server la descarta.
let uidSeq = 0;
const nextUid = () => `v${++uidSeq}`;

const newVariant = (): Variant => ({
  uid: nextUid(),
  color: "",
  size: "",
  stock: 0,
  price: "",
  imageUrl: "",
  images: [],
  description: "",
});

function Section({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-6 first:border-0 first:pt-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {help && <p className="max-w-[70ch] text-sm text-foreground/60">{help}</p>}
      </div>
      {children}
    </section>
  );
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
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const baseVariant = product?.variants.find((v) => v.color === "");
  const [standardVariantId] = useState<string | undefined>(baseVariant?.id);
  const [variants, setVariants] = useState<Variant[]>(
    (product?.variants ?? []).filter((v) => v.color !== "").map((v) => ({ ...v, uid: nextUid() }))
  );
  const [standardStock, setStandardStock] = useState<number>(baseVariant?.stock ?? 0);
  const slug = product?.slug ?? slugify(name);

  function updateVariant(index: number, patch: Partial<Variant>) {
    setVariants((vs) => vs.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function reorderVariant(from: number, to: number) {
    setVariants((vs) => arrayMove(vs, from, to));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await saveProduct({
        id: product?.id,
        name,
        slug,
        description: form.get("description"),
        price: form.get("price"),
        shippingPrice: form.get("shippingPrice") || undefined,
        categoryId,
        images,
        standardStock,
        standardVariantId,
        variants,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Producto guardado.");
      router.push("/admin/productos");
    } catch (err) {
      console.error("[product-form]", err);
      toast.error("No se pudo guardar el producto. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-8 pb-24">
      <Section title="Datos del producto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rebozo bordado a mano"
              required
            />
            {slug && (
              <p className="text-xs text-foreground/55">
                Se verá en la tienda como <span className="font-medium">/tienda/{slug}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Precio en pesos</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="1800"
              defaultValue={product?.price}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shippingPrice">Precio de envío (opcional)</Label>
            <Input
              id="shippingPrice"
              name="shippingPrice"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="150"
              defaultValue={product?.shippingPrice ?? ""}
            />
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
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description}
              placeholder="Contá cómo está hecho y con qué material. Ej: Rebozo tejido artesanalmente, flecos anudados a mano. Material: rayón."
              required
            />
          </div>
        </div>
      </Section>

      <Section
        title="Fotos del producto"
        help="La primera foto es la portada en la tienda. Podés subir varias y quitar las que no quieras."
      >
        <MediaUploader value={images} onChange={setImages} upload={uploadProductFiles} multiple coverBadge />
      </Section>

      <Section
        title="Stock del producto estándar"
        help="El producto siempre se puede comprar tal cual, sin elegir color ni talla. Estas son sus piezas disponibles."
      >
        <div className="flex flex-col gap-1.5 sm:max-w-xs">
          <Label htmlFor="standardStock">Piezas disponibles</Label>
          <Input
            id="standardStock"
            type="number"
            min="0"
            inputMode="numeric"
            value={standardStock}
            onChange={(e) => setStandardStock(Number(e.target.value))}
            required
          />
        </div>
      </Section>

      <Section
        title="Colores y talles (opcional)"
        help="Además del estándar, podés sumar combinaciones de color/talla con su propio stock, fotos y precio."
      >
        <SortableList id="product-variants" ids={variants.map((v) => v.uid!)} onReorder={reorderVariant}>
        <div className="flex flex-col gap-4">
          {variants.map((v, i) => (
            <SortableItem key={v.uid} id={v.uid!}>
              {(handle, isDragging) => (
                <div
                  className={cn(
                    "flex flex-col gap-4 rounded-lg border border-border p-4 transition-opacity",
                    isDragging && "opacity-40"
                  )}
                >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    {...handle}
                    className="flex touch-none cursor-grab items-center text-foreground/40 hover:text-foreground/70 active:cursor-grabbing"
                    aria-label={`Arrastrar para reordenar opción ${i + 1}`}
                  >
                    <FiMove className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium text-foreground/70">Opción {i + 1}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer gap-1.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                  aria-label={`Quitar opción ${i + 1}`}
                >
                  <FiTrash2 className="h-3.5 w-3.5" /> Quitar esta opción
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`color-${i}`}>Color</Label>
                  <Input
                    id={`color-${i}`}
                    placeholder="Negro"
                    value={v.color}
                    onChange={(e) => updateVariant(i, { color: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`size-${i}`}>Talle</Label>
                  <Input
                    id={`size-${i}`}
                    placeholder="Única"
                    value={v.size}
                    onChange={(e) => updateVariant(i, { size: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`stock-${i}`}>Piezas disponibles</Label>
                  <Input
                    id={`stock-${i}`}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`price-${i}`}>Precio (opcional)</Label>
                  <Input
                    id={`price-${i}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder={product?.price ?? "Precio base"}
                    value={v.price}
                    onChange={(e) => updateVariant(i, { price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Foto principal de esta opción</Label>
                  <MediaUploader
                    value={v.imageUrl ? [v.imageUrl] : []}
                    onChange={(urls) => {
                      const [first, ...rest] = urls;
                      updateVariant(i, {
                        imageUrl: first ?? "",
                        images: rest.length ? [...v.images, ...rest] : v.images,
                      });
                    }}
                    upload={uploadProductFiles}
                    hint="Es la que se muestra al elegir este color. Podés subir varias juntas: la primera queda de portada."
                    multiple
                    compact
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Más fotos de esta opción</Label>
                  <MediaUploader
                    value={v.images}
                    onChange={(urls) => updateVariant(i, { images: urls })}
                    upload={uploadProductFiles}
                    hint="Opcional: detalles, otro ángulo, la prenda puesta."
                    multiple
                    compact
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`vdesc-${i}`}>Descripción propia (opcional)</Label>
                <Textarea
                  id={`vdesc-${i}`}
                  rows={2}
                  placeholder="Si la dejás vacía se usa la descripción del producto."
                  value={v.description}
                  onChange={(e) => updateVariant(i, { description: e.target.value })}
                />
              </div>
                </div>
              )}
            </SortableItem>
          ))}
        </div>
        </SortableList>

        <Button
          type="button"
          variant="outline"
          className="w-fit gap-1.5"
          onClick={() => setVariants((vs) => [...vs, newVariant()])}
        >
          <FiPlus className="h-4 w-4" />{" "}
          {variants.length === 0 ? "Agregar colores o talles" : "Agregar otro color o talle"}
        </Button>
      </Section>

      <div className="sticky bottom-0 -mx-8 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-8 py-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Guardando…" : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
}
