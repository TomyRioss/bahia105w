import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
        <h1 className="font-serif text-3xl">Contacto</h1>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">Escribinos</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            ¿Tenés dudas sobre una prenda, una talla o un color? Escribinos por WhatsApp o correo y te respondemos
            con gusto.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">Pedidos y envíos</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            Una vez que armás tu pedido en el sitio, cerramos los detalles de envío y pago directo por WhatsApp,
            para asesorarte mejor y confirmar cada pieza a mano.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">Síguenos</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            Mirá nuestras piezas nuevas y el trabajo detrás de cada bordado en nuestras redes.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="https://wa.me/5213222942660"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FaWhatsapp className="h-5 w-5" />
            +52 1 322 294 2660
          </Link>
          <Link
            href="mailto:hola@boutiquemex.mx"
            className="flex items-center gap-2 rounded-full bg-cafe px-6 py-3 text-sm font-medium text-cream transition hover:opacity-90"
          >
            <FiMail className="h-5 w-5" />
            hola@boutiquemex.mx
          </Link>
          <Link
            href="https://www.instagram.com/bahia_105w?igsi=NjAxYWFiNGt3emMy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FaInstagram className="h-5 w-5" />
            Instagram
          </Link>
          <Link
            href="https://www.facebook.com/share/196VwdM7LU/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#1877F2] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FaFacebookF className="h-5 w-5" />
            Facebook
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
