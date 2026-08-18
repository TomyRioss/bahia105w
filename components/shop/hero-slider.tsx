"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Slide = { id: string; imageUrl: string; title: string | null; link: string | null };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  const content = (
    <>
      <Image
        src={slide.imageUrl}
        alt={slide.title ?? "Bahia 105w"}
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/70 via-black/30 to-black/40 text-center text-white">
        {slide.title && (
          <h1 className="max-w-2xl font-serif text-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl">{slide.title}</h1>
        )}
        <button className="mt-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-foreground">
          Comprar
        </button>
      </div>
    </>
  );

  return (
    <section className="relative h-[80vh] min-h-[480px] w-full">
      {slide.link ? (
        <Link href={slide.link} className="absolute inset-0">
          {content}
        </Link>
      ) : (
        content
      )}

      {slides.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-foreground hover:bg-white"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Siguiente"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-foreground hover:bg-white"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Ir a slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
