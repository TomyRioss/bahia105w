import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

const sections = [
  {
    id: "nuestra-historia",
    title: "Nuestra historia",
    body: "Bahía 105W inició en 2022 con la intención de dar a conocer el trabajo de artesanos y diseñadores mexicanos. Con el tiempo, descubrimos que diseñadores de distintas partes del mundo también tienen mucho que aportar a la moda y al concepto de nuestra tienda. Por eso ofrecemos una gran variedad de artículos que te sorprenderán y encantarán por su trabajo y calidad, y que te harán lucir bella y elegante.",
  },
  {
    id: "nuestro-compromiso",
    title: "Nuestro compromiso",
    body: "Trabajamos de la mano con diseñadores y artesanos que cada día buscan sorprendernos con sus diseños y propuestas en el ámbito de la moda.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:items-start lg:gap-16">
        <aside className="flex shrink-0 flex-col gap-4 lg:sticky lg:top-24 lg:w-64">
          <Link
            href="https://wa.me/5213222942660"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md bg-cafe px-5 py-4 text-cream transition-colors hover:bg-cafe/90"
          >
            <FaWhatsapp className="h-7 w-7 shrink-0 text-[#25D366]" />
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-cream/70">Escribinos</span>
              <span className="text-sm font-medium">+52 1 322 294 2660</span>
            </span>
          </Link>

          <nav aria-label="Índice" className="rounded-md border border-foreground/10 bg-cream/60 p-5">
            <p className="mb-3 font-serif text-sm uppercase tracking-wide text-foreground/60">Índice</p>
            <ul className="flex flex-col gap-2.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-foreground/80 transition-colors hover:text-rosa">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="flex max-w-2xl flex-1 flex-col gap-10">
          <div className="flex flex-col gap-3 border-b border-foreground/10 pb-6">
            <h1 className="font-serif text-4xl">¿Quiénes somos?</h1>
            <p className="text-sm text-foreground/60">Bordado a mano, hecho en México.</p>
          </div>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-3">
              <h2 className="font-serif text-2xl">{s.title}</h2>
              <p className="text-sm leading-relaxed text-foreground/70">{s.body}</p>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
