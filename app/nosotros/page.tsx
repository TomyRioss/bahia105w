import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
        <h1 className="font-serif text-3xl">¿Quiénes somos?</h1>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">Nuestra historia</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            Somos Bahía 105W, un espacio dedicado a piezas hechas a mano en México. Nacimos con la idea de acercar
            el bordado tradicional mexicano a quienes buscan prendas únicas, con historia y con alma, lejos de la
            producción en serie.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">El proceso artesanal</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            Cada prenda está bordada a mano por artesanas mexicanas, punto por punto. Ninguna pieza es exactamente
            igual a otra: los tiempos, los colores y los detalles varían según la mano que la trabajó, lo que hace
            que cada compra sea también una pieza de coleccionista.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">Nuestro compromiso</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            Trabajamos de la mano con las artesanas para asegurar un pago justo por su trabajo y para mantener viva
            la tradición del bordado mexicano. Cada pieza que llevás con vos ayuda a sostener ese oficio.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
