"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/admin-orders";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, value as "PENDIENTE" | "CONFIRMADO" | "COMPLETADO");
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Estado actualizado.");
    });
  }

  const [value, setValue] = useState(status);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (!v) return;
        setValue(v);
        handleChange(v);
      }}
      disabled={pending}
    >
      <SelectTrigger className="w-40">
        <SelectValue>{() => STATUS_LABEL[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABEL).map(([statusValue, label]) => (
          <SelectItem key={statusValue} value={statusValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
