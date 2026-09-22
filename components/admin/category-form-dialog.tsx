"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaUploader } from "@/components/admin/media-uploader";
import { saveCategory } from "@/lib/actions/admin-categories";
import { uploadBannerFile } from "@/lib/actions/admin-banners";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string; slug: string; image?: string | null };

export function CategoryFormDialog({
  category,
  trigger,
}: {
  category?: Category;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [image, setImage] = useState<string[]>(category?.image ? [category.image] : []);

  const slug = category?.slug ?? slugify(name);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await saveCategory({ id: category?.id, name, slug, image: image[0] ?? "" });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Categoría guardada.");
      setOpen(false);
    } catch (err) {
      console.error("[category-form]", err);
      toast.error("No se pudo guardar la categoría. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vestidos"
              required
            />
            {slug && (
              <p className="text-xs text-foreground/55">
                Se verá en la tienda como <span className="font-medium">/tienda/{slug}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Imagen</Label>
            <MediaUploader
              value={image}
              onChange={setImage}
              upload={uploadBannerFile}
              compact
              hint="Foto que representa la categoría en la tienda."
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar categoría"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
