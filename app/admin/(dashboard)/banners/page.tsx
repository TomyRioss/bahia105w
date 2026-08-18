import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BannerFormDialog } from "@/components/admin/banner-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBanner } from "@/lib/actions/admin-banners";

function BannerCard({ b }: { b: { id: string; type: string; imageUrl: string; title: string | null; order: number } }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 p-3">
      <div className="relative aspect-video overflow-hidden bg-cream">
        <Image src={b.imageUrl} alt={b.title ?? ""} fill className="object-cover" />
      </div>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{b.type}</Badge>
        <span className="text-xs text-foreground/50">orden {b.order}</span>
      </div>
      {b.title && <p className="text-sm">{b.title}</p>}
      <div className="flex justify-end gap-1">
        <BannerFormDialog
          banner={b as never}
          trigger={
            <Button variant="ghost" size="sm">
              Editar
            </Button>
          }
        />
        <DeleteButton action={deleteBanner.bind(null, b.id)} confirmMessage="¿Eliminar esta imagen?" />
      </div>
    </div>
  );
}

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: [{ type: "asc" }, { order: "asc" }] });
  const hero = banners.filter((b) => b.type === "HERO");
  const tradicion = banners.filter((b) => b.type === "FLYER" || b.type === "BANNER");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Vitrina — Hero, flyers y banners</h1>
        <BannerFormDialog trigger={<Button>Nueva imagen</Button>} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground/60">Hero (slider principal)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hero.map((b) => (
            <BannerCard key={b.id} b={b} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground/60">Sección tradición (flyer izq. + banner centro + flyer der.)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tradicion.map((b) => (
            <BannerCard key={b.id} b={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
