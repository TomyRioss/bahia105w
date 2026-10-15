import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  slug,
  name,
  price,
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
    <Link href={`/producto/${slug}`} className="group flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cafe">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {!img && (
          <p className="flex h-full items-center justify-center px-4 text-center text-sm text-foreground/70">
            Imagen no disponible
          </p>
        )}
        {img && (
          <Image
            src={img}
            alt={name}
            fill
            className={`object-contain transition-opacity duration-500 ease-out motion-reduce:transition-none ${hoverImg ? "group-hover:opacity-0 group-focus-visible:opacity-0" : ""}`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {hoverImg && (
          <Image
            src={hoverImg}
            alt={`${name} en modelo`}
            fill
            className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
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
