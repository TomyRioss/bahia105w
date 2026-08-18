"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage = "¿Eliminar este elemento?",
}: {
  action: () => Promise<{ ok?: boolean; error?: string }>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const res = await action();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Eliminado.");
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} disabled={pending} aria-label="Eliminar">
      <FiTrash2 className="h-4 w-4 text-rosa" />
    </Button>
  );
}
