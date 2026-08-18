import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-cafe px-6 py-20 text-cream sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Image src="/logo.jpg" alt="Bahia 105W" width={72} height={72} className="rounded-md" />
          <p className="mt-2 text-sm">+52 981 171 7898</p>
          <p className="text-sm">hola@boutiquemex.mx</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-medium">Tienda</p>
          <Link href="/tienda/vestidos">Vestidos</Link>
          <Link href="/tienda/blusas">Blusas</Link>
          <Link href="/tienda/huipiles">Huipiles</Link>
          <Link href="/tienda/accesorios">Accesorios</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-medium">Legal</p>
          <a href="#">Aviso de privacidad</a>
          <a href="#">Envíos y devoluciones</a>
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 items-center gap-3 border-t border-cream/20 pt-6 text-xs text-cream/70 sm:grid-cols-3">
        <p className="text-center sm:text-left">© 2026 Bahia 105w.</p>
        <a
          href="https://ttmagencia.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center underline underline-offset-2 hover:text-cream"
        >
          Desarrollado por TTM Agencia
        </a>
        <Link href="/admin/login" className="text-center hover:text-cream sm:text-right">
          Admin
        </Link>
      </div>
    </footer>
  );
}
