"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { pbAdmin, esc } from "@/lib/pocketbase";

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Necesitás iniciar sesión.");
  const userId = session.user.id;

  const pb = await pbAdmin();
  let existing: { id: string } | null = null;
  try {
    existing = await pb.collection("favorites").getFirstListItem<{ id: string }>(
      `user="${esc(userId)}"&&product="${esc(productId)}"`,
    );
  } catch {
    existing = null;
  }

  if (existing) {
    await pb.collection("favorites").delete(existing.id);
  } else {
    await pb.collection("favorites").create({ user: userId, product: productId });
  }

  revalidatePath("/cuenta/favoritos");
  return { favorited: !existing };
}

export async function isFavorited(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;
  const pb = await pbAdmin();
  try {
    await pb.collection("favorites").getFirstListItem(
      `user="${esc(session.user.id)}"&&product="${esc(productId)}"`,
    );
    return true;
  } catch {
    return false;
  }
}
