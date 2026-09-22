"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => setIndex(0), [images]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  if (images.length === 0) {
    return <div className="relative aspect-[9/16] max-h-[80vh] overflow-hidden bg-cream" />;
  }

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex w-16 shrink-0 flex-col gap-2 overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative aspect-[9/16] w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                i === index ? "border-cafe" : "border-transparent"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative aspect-[9/16] h-[80vh] cursor-zoom-in overflow-hidden bg-cream"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={images[index]}
          alt={alt}
          fill
          className="object-cover transition-transform duration-200 ease-out"
          style={{ transformOrigin: zoomOrigin, transform: zoomed ? "scale(2)" : "scale(1)" }}
          priority
          sizes="(min-width: 640px) 50vw, 100vw"
        />
      </div>
    </div>
  );
}
