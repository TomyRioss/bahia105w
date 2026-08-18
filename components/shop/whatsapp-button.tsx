import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsappButton() {
  return (
    <Link
      href="https://wa.me/5213222942660"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Asesorate con nosotros por WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center"
    >
      <span className="-mr-5 rounded-full bg-cream py-2 pl-4 pr-8 text-sm font-medium whitespace-nowrap text-cafe shadow-lg">
        Asesorate con nosotros
      </span>
      <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform group-hover:scale-105">
        <FaWhatsapp className="h-7 w-7" />
      </span>
    </Link>
  );
}
