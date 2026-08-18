"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBanner } from "@/lib/actions/admin-banners";

type Banner = {
  id: string;
  type: "HERO" | "FLYER" | "BANNER";
  imageUrl: string;
  title: string | null;
  link: string | null;
  order: number;
};

const TYPE_LABEL: Record<Banner["type"], string> = {
  HERO: "Hero (portada)",
  FLYER: "Flyer",
  BANNER: "Banner",
};

export function BannerFormDialog({ banner, trigger }: { banner?: Banner; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<Banner["type"]>(banner?.type ?? "HERO");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await saveBanner({
      id: banner?.id,
      type,
      imageUrl: form.get("imageUrl"),
      title: form.get("title"),
      link: form.get("link"),
      order: form.get("order"),
    });
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Guardado.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banner ? "Editar imagen" : "Nueva imagen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as Banner["type"])}>
              <SelectTrigger>
                <SelectValue>{() => TYPE_LABEL[type]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">URL de la imagen</Label>
            <Input id="imageUrl" name="imageUrl" type="url" defaultValue={banner?.imageUrl} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input id="title" name="title" defaultValue={banner?.title ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link">Link (opcional)</Label>
            <Input id="link" name="link" defaultValue={banner?.link ?? ""} placeholder="/tienda/vestidos" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order">Orden</Label>
            <Input id="order" name="order" type="number" defaultValue={banner?.order ?? 0} />
          </div>
          <Button type="submit" disabled={loading}>
            Guardar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
