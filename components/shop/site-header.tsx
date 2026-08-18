"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiSearch, FiUser, FiHeart, FiShoppingBag } from "react-icons/fi";
import { useCartStore, cartCount } from "@/lib/cart-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/tienda/vestidos", label: "Tienda" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/como-comprar", label: "Cómo Comprar" },
];

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(!overHero);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const transparent = overHero && !scrolled;

  return (
    <div className={overHero ? "fixed inset-x-0 top-0 z-50" : ""}>
      <div
        className={`py-2 text-center text-xs tracking-wide transition-colors duration-300 ${
          transparent ? "bg-transparent text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" : "bg-cafe text-cream"
        }`}
      >
        Envíos a todo el mundo — piezas hechas a mano en México
      </div>

      <header
        className={`flex items-center border-b px-6 py-4 transition-colors duration-500 ease-out sm:px-10 ${
          transparent ? "border-transparent bg-transparent" : "border-foreground/10 bg-background"
        }`}
      >
        <Link
          href="/"
          style={{ width: transparent ? "clamp(4.5rem, 8vw, 6.5rem)" : "3rem" }}
          className="relative aspect-square shrink-0 transition-[width] duration-500 ease-out"
        >
          <Image src="/logo.jpg" alt="Bahia 105W" fill priority className="object-contain" />
        </Link>
        <nav
          style={{ flexGrow: transparent ? 0 : 1, marginLeft: transparent ? "2.5rem" : "0" }}
          className={`hidden items-center justify-center gap-8 text-sm transition-[flex-grow,margin-left] duration-500 ease-out sm:flex ${transparent ? "text-white" : ""}`}
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={transparent ? "hover:text-white/70" : "hover:text-cafe"}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className={`ml-auto flex shrink-0 items-center gap-6 ${transparent ? "text-white" : ""}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`);
            }}
            className="relative hidden sm:block"
          >
            <FiSearch
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                transparent ? "text-white/70" : "text-foreground/40"
              }`}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className={`w-72 rounded-full border bg-transparent py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 ${
                transparent
                  ? "border-white/40 text-white placeholder:text-white/60 focus:ring-white/50"
                  : "border-foreground/15 placeholder:text-foreground/40 focus:ring-foreground/30"
              }`}
            />
          </form>
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Cuenta"
                className={transparent ? "text-white hover:text-white/70" : "text-foreground/80 hover:text-foreground"}
              >
                <FiUser className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/cuenta/pedidos")}>Mis pedidos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/cuenta/favoritos")}>Favoritos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              aria-label="Cuenta"
              className={transparent ? "text-white hover:text-white/70" : "text-foreground/80 hover:text-foreground"}
            >
              <FiUser className="h-5 w-5" />
            </Link>
          )}
          <Link
            href={session?.user ? "/cuenta/favoritos" : "/login"}
            aria-label="Favoritos"
            className={`relative ${transparent ? "text-white hover:text-white/70" : "text-foreground/80 hover:text-foreground"}`}
          >
            <FiHeart className="h-5 w-5" />
          </Link>
          <Link
            href={session?.user ? "/carrito" : "/login"}
            aria-label="Bolsa"
            className={`relative ${transparent ? "text-white hover:text-white/70" : "text-foreground/80 hover:text-foreground"}`}
          >
            <FiShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rosa text-[10px] text-rosa-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>
    </div>
  );
}
