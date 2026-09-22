import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

const sections = [
  {
    id: "nuestra-historia",
    title: "Nuestra historia",
    body: "Somos Bahía 105W, un espacio dedicado a piezas hechas a mano. Diseño por artesanos de México y el mundo, para quienes buscan prendas únicas, con historia y con alma, lejos de la producción en serie.",
  },
  {
    id: "el-proceso-artesanal",
    title: "El proceso artesanal",
    body: "Cada prenda está bordada a mano por artesanas mexicanas, punto por punto. Ninguna pieza es exactamente igual a otra: los tiempos, los colores y los detalles varían según la mano que la trabajó, lo que hace que cada compra sea también una pieza de coleccionista.",
  },
  {
    id: "nuestro-compromiso",
    title: "Nuestro compromiso",
    body: "Trabajamos de la mano con las artesanas para asegurar un pago justo por su trabajo y para mantener viva la tradición del bordado mexicano. Cada pieza que llevás con vos ayuda a sostener ese oficio.",
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
