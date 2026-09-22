import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  slug,
  name,
  price,
  color,
  img,
  hoverImg,
}: {
  slug: string;
  name: string;
  price: number | string;
  color: string | null;
  img: string | null;
  hoverImg?: string | null;
}) {
  return (
    <Link href={`/producto/${slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {img && (
          <Image
            src={img}
            alt={name}
            fill
            className="object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-0 group-hover:blur-sm"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {hoverImg && (
          <Image
            src={hoverImg}
            alt={name}
            fill
            className="object-cover opacity-0 blur-sm transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100 group-hover:blur-none"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-foreground">{name}</p>
        <p className="text-sm text-cafe">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
