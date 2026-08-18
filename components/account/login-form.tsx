"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

function PasswordInput({ id, name, minLength }: { id: string; name: string; minLength?: number }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
      >
        {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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
      toast.success("Sesión iniciada.");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[login]", err);
      toast.error("No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password,
    };
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("[register] respuesta inválida", parseErr);
        toast.error("El servidor devolvió una respuesta inesperada.");
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo crear la cuenta.");
        return;
      }
      const login = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
      if (login?.error) {
        toast.error("Cuenta creada, pero no se pudo iniciar sesión automáticamente. Iniciá sesión manualmente.");
        return;
      }
      toast.success("Cuenta creada.");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[register]", err);
      toast.error("No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-20">
      <div className="text-center">
        <h1 className="font-serif text-2xl">Mi cuenta</h1>
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-2 rounded-full"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <FcGoogle className="h-4 w-4" /> Continuar con Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-foreground/10" /> o <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <Tabs defaultValue="login">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">Iniciar sesión</TabsTrigger>
          <TabsTrigger value="register" className="flex-1">Crear cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">Contraseña</Label>
              <PasswordInput id="login-password" name="password" />
            </div>
            <Button type="submit" disabled={loading} className="rounded-full">
              Iniciar sesión
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-name">Nombre</Label>
              <Input id="reg-name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-password">Contraseña</Label>
              <PasswordInput id="reg-password" name="password" minLength={6} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-confirm-password">Confirmar contraseña</Label>
              <PasswordInput id="reg-confirm-password" name="confirmPassword" minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="rounded-full">
              Crear cuenta
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
