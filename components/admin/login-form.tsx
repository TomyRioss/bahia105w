"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKDROP_URL =
  "https://images.pexels.com/photos/34987943/pexels-photo-34987943.jpeg?auto=compress&cs=tinysrgb&w=1600";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (res?.error) {
        toast.error("Email o contraseña incorrectos.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("[admin-login]", err);
      toast.error("No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative h-56 w-full shrink-0 lg:h-auto lg:w-[45%]">
        <Image
          src={BACKDROP_URL}
          alt="Bordado artesanal mexicano"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-cafe/50" />

        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image src="/logo.jpg" alt="Bahia 105W" width={140} height={140} className="rounded-lg" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-16">
        <div
          className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
        >
          <p className="text-[10px] tracking-[0.3em] text-foreground/50">PANEL ADMIN</p>
          <h1 className="mt-2 font-serif text-3xl">Bienvenida de vuelta</h1>
          <div className="mt-3 h-px w-10 bg-rosa" />
          <p className="mt-4 text-sm text-foreground/60">
            Iniciá sesión para gestionar el catálogo y los pedidos.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                className="h-11 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-password">Contraseña</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="h-11 rounded-lg"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 rounded-full bg-cafe text-cream hover:bg-cafe/90"
            >
              {loading ? "Iniciando sesión…" : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
