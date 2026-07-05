"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { quickUpdateProductStatusAction, type QuickStatusState } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { productStatuses } from "@/lib/constants";

const initialState: QuickStatusState = {};

/**
 * Form quick-status dipakai di dropdown aksi produk (/admin/products).
 * Pakai `useActionState` (bukan `<form action={serverAction}>` polos + redirect)
 * supaya TIDAK bergantung pada redirect ke pathname sama yang macet di build
 * produksi — lihat catatan panjang di actions/products.ts. Hasil sukses/error
 * ditampilkan lewat toast langsung dari state, tanpa navigasi apa pun.
 */
export function QuickStatusForm({ productId, currentStatus }: { productId: string; currentStatus: string }) {
  const [state, formAction, isPending] = useActionState(quickUpdateProductStatusAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-2 px-2 pb-2 pt-1">
      <input type="hidden" name="productId" value={productId} />
      <Select name="status" defaultValue={currentStatus} className="h-10 rounded-xl text-sm">
        {productStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={isPending} className="w-full justify-center rounded-xl">
        {isPending ? "Memproses..." : "Apply status"}
      </Button>
    </form>
  );
}
