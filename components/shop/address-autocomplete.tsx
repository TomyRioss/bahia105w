"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Suggestion = { place_id: number; display_name: string };

const NOMINATIM = "https://nominatim.openstreetmap.org";

export function AddressAutocomplete({
  value,
  onChange,
  id = "contactAddress",
  name = "contactAddress",
  label = "Dirección de envío",
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  label?: string;
}) {
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  // Evita buscar de nuevo el texto que acabamos de completar desde una sugerencia o el GPS.
  const skipNextSearch = useRef(true);
  const boxRef = useRef<HTMLDivElement>(null);

  function applyAddress(next: string) {
    skipNextSearch.current = true;
    onChange(next);
    setSuggestions([]);
    setOpen(false);
  }

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const query = value.trim();
    if (query.length < 4) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${NOMINATIM}/search?format=json&addressdetails=1&limit=5&countrycodes=mx&q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("[address] search", err);
        toast.error("No se pudieron buscar direcciones. Escribila manualmente.");
      } finally {
        setSearching(false);
      }
      // Nominatim pide máximo 1 consulta por segundo: el debounce mantiene el ritmo.
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>

      <div ref={boxRef} className="relative">
        <Input
          id={id}
          name={name}
          required
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Calle, número, colonia, ciudad"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-foreground/40" />
        )}

        {open && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-foreground/15 bg-background shadow-lg">
            {suggestions.map((s) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onClick={() => applyAddress(s.display_name)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-foreground/5"
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-foreground/50">Escribí tu dirección y elegí una sugerencia.</p>
    </div>
  );
}
