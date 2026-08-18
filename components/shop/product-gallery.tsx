"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [images]);

  if (images.length === 0) {
    return <div className="relative aspect-[3/4] max-h-[80vh] overflow-hidden bg-cream" />;
  }

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] max-h-[80vh] overflow-hidden bg-cream">
        <Image src={images[index]} alt={alt} fill className="object-cover" priority sizes="(min-width: 640px) 60vw, 100vw" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow hover:bg-white"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow hover:bg-white"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                i === index ? "border-cafe" : "border-transparent"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
