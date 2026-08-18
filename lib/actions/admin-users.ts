"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/actions/admin-guard";
import { newAdminSchema } from "@/lib/validations/admin";

export async function createAdmin(input: unknown) {
  await requireOwner();
  const parsed = newAdminSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe un usuario con ese email." };

  try {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashed, role: "ADMIN" },
    });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (err) {
    console.error("[createAdmin]", err);
    return { error: "No se pudo crear el admin." };
  }
}
