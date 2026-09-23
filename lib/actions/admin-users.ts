"use server";

import { revalidatePath } from "next/cache";
import { pbAdmin, esc } from "@/lib/pocketbase";
import { requireOwner } from "@/lib/actions/admin-guard";
import { newAdminSchema } from "@/lib/validations/admin";

export async function createAdmin(input: unknown) {
  await requireOwner();
  const parsed = newAdminSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;

  try {
    const pb = await pbAdmin();
    try {
      await pb.collection("users").getFirstListItem(`email="${esc(email)}"`);
      return { error: "Ya existe un usuario con ese email." };
    } catch {
      // No existe, seguir.
    }
    await pb.collection("users").create({
      name, email, emailVisibility: true, verified: true,
      password, passwordConfirm: password, role: "ADMIN",
    });
    revalidatePath("/admin/usuarios");
    return { ok: true };
  } catch (err) {
    console.error("[createAdmin]", err);
    return { error: "No se pudo crear el admin." };
  }
}
