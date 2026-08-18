"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Necesitás iniciar sesión.");

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, productId } });
  }

  revalidatePath("/cuenta/favoritos");
  return { favorited: !existing };
}

export async function isFavorited(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;
  const fav = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });
  return !!fav;
}
