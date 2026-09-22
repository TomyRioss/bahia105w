"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader, isVideo } from "@/components/admin/media-uploader";
import { saveBanner, uploadBannerFile } from "@/lib/actions/admin-banners";

type Banner = {
  id: string;
  type: "HERO" | "FLYER" | "BANNER";
  imageUrl: string;
  videoUrlDesktop?: string | null;
  videoUrlMobile?: string | null;
  title: string | null;
  link: string | null;
  order: number;
};

const TYPE_LABEL: Record<Banner["type"], string> = {
  HERO: "Portada principal",
  FLYER: "Foto lateral",
  BANNER: "Foto central",
};

const NO_LINK = "none";

const LINK_OPTIONS = [
  { label: "A ningún lado", value: NO_LINK },
  { label: "Toda la tienda", value: "/tienda" },
  { label: "Cómo comprar", value: "/como-comprar" },
  { label: "Nosotros", value: "/nosotros" },
  { label: "Contacto", value: "/contacto" },
];

const ORDER_OPTIONS: Record<"FLYER" | "BANNER", { label: string; value: number }[]> = {
  FLYER: [
    { label: "Izquierda", value: 0 },
    { label: "Derecha", value: 1 },
  ],
  BANNER: [{ label: "Centro", value: 0 }],
};

export function BannerFormDialog({
  banner,
  trigger,
  fixedType,
}: {
  banner?: Banner;
  trigger: React.ReactElement;
  fixedType?: "HERO";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<Banner["type"]>(banner?.type ?? fixedType ?? "FLYER");
  const [media, setMedia] = useState(
    banner?.videoUrlDesktop || banner?.imageUrl || ""
  );
  const [link, setLink] = useState(banner?.link || NO_LINK);
  const [order, setOrder] = useState(banner?.order ?? 0);

  const isHero = type === "HERO";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!media) {
      toast.error("Subí una imagen antes de guardar.");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const video = isVideo(media);

    try {
      const res = await saveBanner({
        id: banner?.id,
        type,
        imageUrl: media,
        videoUrlDesktop: video ? media : "",
        videoUrlMobile: video ? media : "",
        title: form.get("title"),
        link: link === NO_LINK ? "" : link,
        order: isHero ? 0 : order,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Guardado.");
      setOpen(false);
    } catch (err) {
      console.error("[banner-form]", err);
      toast.error("No se pudo guardar. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banner ? "Editar imagen" : "Nueva imagen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isHero && (
            <div className="flex flex-col gap-1.5">
              <Label>Lugar en la página</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as Banner["type"]);
                  setOrder(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue>{() => TYPE_LABEL[type]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABEL)
                    .filter(([value]) => value !== "HERO")
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>{isHero ? "Imagen o video de portada" : "Imagen"}</Label>
            <MediaUploader
              value={media ? [media] : []}
              onChange={(urls) => setMedia(urls[0] ?? "")}
              upload={uploadBannerFile}
              accept={isHero ? "image/*,video/*" : "image/*"}
              hint={
                isHero
                  ? "Se muestra a pantalla completa. Podés subir una foto o un video."
                  : "Foto horizontal, se recorta a lo ancho de la sección."
              }
              compact
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título sobre la imagen (opcional)</Label>
            <Input id="title" name="title" defaultValue={banner?.title ?? ""} placeholder="Nueva colección" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>¿A dónde lleva al tocarla?</Label>
            <Select value={link} onValueChange={(v) => v !== null && setLink(v)}>
              <SelectTrigger>
                <SelectValue>{() => LINK_OPTIONS.find((o) => o.value === link)?.label ?? "A ningún lado"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LINK_OPTIONS.map((o) => (
                  <SelectItem key={o.value || "none"} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isHero && (
            <div className="flex flex-col gap-1.5">
              <Label>Posición</Label>
              <div className="flex flex-wrap gap-2">
                {ORDER_OPTIONS[type as "FLYER" | "BANNER"].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setOrder(opt.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      order === opt.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 text-foreground/70 hover:border-foreground/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            Guardar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
