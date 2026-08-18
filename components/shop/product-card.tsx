import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  slug,
  name,
  price,
  color,
  img,
}: {
  slug: string;
  name: string;
  price: number | string;
  color: string | null;
  img: string | null;
}) {
  return (
    <Link href={`/producto/${slug}`} className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {img && (
          <Image
            src={img}
            alt={name}
            fill
            className="object-cover transition-transform hover:scale-105"
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
