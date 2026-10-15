// This legacy storage host no longer resolves. Keep unavailable assets out of
// the image optimizer until their originals are restored to the media library.
export function availableProductImage(image: string | null | undefined): string | null {
  if (!image?.trim()) return null;
  try {
    if (new URL(image).hostname === "krfrcoxzqpfbqnsylnte.supabase.co") return null;
  } catch {
    // Relative image paths are supported too.
  }
  return image;
}

export function productCardImages(
  images: string[],
  variant?: { imageUrl?: string | null; images?: string[] },
) {
  // Product gallery: model, flat garment, details.
  // Variant gallery: imageUrl is the model; images starts with the flat garment.
  const cover = availableProductImage(variant?.images?.[0])
    || availableProductImage(images[1])
    || availableProductImage(images[0])
    || availableProductImage(variant?.imageUrl);
  const model = availableProductImage(variant?.imageUrl)
    || availableProductImage(images[0]);
  return { cover, hoverImage: model !== cover ? model : null };
}
