"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { FiLoader, FiUploadCloud, FiX } from "react-icons/fi";
import { SortableItem, SortableList, arrayMove } from "@/components/admin/sortable-list";
import { cn } from "@/lib/utils";

type UploadResult = { urls?: string[]; url?: string; error?: string };

export function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

function Preview({
  url,
  onRemove,
  main,
  handle,
  isDragging,
}: {
  url: string;
  onRemove: () => void;
  main?: boolean;
  handle: React.HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void };
  isDragging?: boolean;
}) {
  return (
    <div
      {...handle}
      className={cn(
        "group relative aspect-square touch-none cursor-grab overflow-hidden rounded-lg border border-border bg-muted active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      {isVideo(url) ? (
        <video src={url} muted playsInline className="h-full w-full object-cover" />
      ) : (
        <Image src={url} alt="" fill sizes="160px" className="object-cover" draggable={false} />
      )}
      {main && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-medium text-background">
          Portada
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar foto"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground/70 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring hover:text-destructive"
      >
        <FiX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * Subida de archivos desde el dispositivo. Sin campos de URL: quien carga
 * productos elige fotos, ve la miniatura y las quita con la X.
 */
export function MediaUploader({
  value,
  onChange,
  upload,
  multiple = false,
  accept = "image/*",
  hint,
  compact,
  coverBadge,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  upload: (formData: FormData) => Promise<UploadResult>;
  multiple?: boolean;
  accept?: string;
  hint?: string;
  compact?: boolean;
  coverBadge?: boolean;
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function send(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => {
        fd.append("files", f);
        fd.set("file", f);
      });
      const res = await upload(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const urls = res.urls ?? (res.url ? [res.url] : []);
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
      toast.success(urls.length > 1 ? `${urls.length} fotos subidas.` : "Foto subida.");
    } catch (err) {
      console.error("[media-uploader]", err);
      toast.error("No se pudo subir el archivo. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <SortableList
          id={inputId}
          ids={value.map((url, i) => `${url}-${i}`)}
          onReorder={(from, to) => onChange(arrayMove(value, from, to))}
        >
          <div
            className={cn(
              "grid gap-2",
              compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5 lg:grid-cols-6"
            )}
          >
            {value.map((url, i) => (
              <SortableItem key={`${url}-${i}`} id={`${url}-${i}`}>
                {(handle, isDragging) => (
                  <Preview
                    url={url}
                    main={coverBadge && i === 0}
                    onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
                    isDragging={isDragging}
                    handle={handle}
                  />
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void send(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 text-center transition-colors duration-200",
          compact ? "px-3 py-4" : "px-4 py-7",
          dragging && "border-foreground/40 bg-muted",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <FiLoader className="h-5 w-5 animate-spin text-foreground/60 motion-reduce:animate-none" />
        ) : (
          <FiUploadCloud className="h-5 w-5 text-foreground/50" />
        )}
        <span className="text-sm font-medium">
          {uploading
            ? "Subiendo…"
            : value.length > 0 && multiple
              ? "Agregar más fotos"
              : multiple
                ? "Subir fotos"
                : "Subir foto"}
        </span>
        <span className="text-xs text-foreground/60">
          {hint ?? "Arrastrá los archivos acá o tocá para elegirlos del dispositivo."}
        </span>
      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={uploading}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void send(files);
        }}
      />
    </div>
  );
}
