import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { FiBox, FiGrid, FiImage, FiShoppingBag, FiUsers } from "react-icons/fi";

const NAV = [
  { href: "/admin/productos", label: "Productos", icon: FiBox },
  { href: "/admin/categorias", label: "Categorías", icon: FiGrid },
  { href: "/admin/banners", label: "Vitrina", icon: FiImage },
  { href: "/admin/pedidos", label: "Pedidos", icon: FiShoppingBag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
    redirect("/admin/login");
  }

  const nav =
    session.user.role === "OWNER"
      ? [...NAV, { href: "/admin/usuarios", label: "Usuarios", icon: FiUsers }]
      : NAV;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-foreground/10 bg-cream px-4 py-6">
        <p className="mb-4 px-2 font-serif text-lg">Panel Admin</p>
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-background"
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
        <Link href="/" className="mt-6 px-3 text-xs text-foreground/50 hover:text-foreground">
          ← Volver a la tienda
        </Link>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
