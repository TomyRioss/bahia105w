"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FiHeart } from "react-icons/fi";
import { toggleFavorite, isFavorited } from "@/lib/actions/favorites";

export function FavoriteButton({ productId }: { productId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "authenticated") return;
    isFavorited(productId).then(setFavorited).catch(() => {});
  }, [productId, status]);

  function handleClick() {
    if (!session?.user) {
      toast.error("Iniciá sesión para guardar favoritos.");
      router.push("/login");
      return;
    }
    startTransition(async () => {
      try {
        const res = await toggleFavorite(productId);
        setFavorited(res.favorited);
      } catch (err) {
        console.error("[favorite]", err);
        toast.error("No se pudo actualizar favoritos.");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label="Favorito"
      className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
    >
      <FiHeart className={`h-5 w-5 ${favorited ? "fill-rosa text-rosa" : ""}`} />
      {favorited ? "Guardado" : "Guardar"}
    </button>
  );
}
