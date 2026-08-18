"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdmin } from "@/lib/actions/admin-users";

export function AdminUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await createAdmin({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });

    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Admin creado.");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-admin-name">Nombre</Label>
        <Input id="new-admin-name" name="name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-admin-email">Email</Label>
        <Input id="new-admin-email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-admin-password">Contraseña</Label>
        <Input id="new-admin-password" name="password" type="password" minLength={6} required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creando…" : "Crear admin"}
      </Button>
    </form>
  );
}
