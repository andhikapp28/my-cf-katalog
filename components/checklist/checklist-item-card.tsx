"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { quickUpdateProductStatusAction } from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/products/product-image";
import {
  eventDayBadgeStyles,
  eventDayShortLabels,
  eventDays,
  priorities,
  priorityStyles,
  productStatuses,
  statusStyles
} from "@/lib/constants";
import { isDoneProductStatus } from "@/lib/checklist";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ChecklistProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  priority: (typeof priorities)[number];
  status: (typeof productStatuses)[number];
  targetDay?: (typeof eventDays)[number];
  isRush?: boolean;
  poPickupNotes?: string | null;
  notes: string | null;
  productLink: string | null;
  circleId: string;
  circleName: string;
  boothCode: string | null;
};

// Tombol aksi lanjutan yang ditawarkan tergantung status saat ini — hanya
// transisi yang masuk akal saat "berburu" di venue, supaya tidak terlalu
// banyak tombol di satu card (mobile, target sentuh besar).
const nextStepByStatus: Record<string, { value: (typeof productStatuses)[number]; label: string }[]> = {
  TARGET: [
    { value: "PO_OPEN", label: "Buka PO" },
    { value: "CANCELLED", label: "Batal" }
  ],
  PO_OPEN: [
    { value: "PO_DONE", label: "PO selesai" },
    { value: "CANCELLED", label: "Batal" }
  ],
  PO_DONE: [{ value: "CANCELLED", label: "Batal" }]
};

export function ChecklistItemCard({ product }: { product: ChecklistProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    product.status,
    (_current: (typeof productStatuses)[number], next: (typeof productStatuses)[number]) => next
  );
  const [previousStatus, setPreviousStatus] = useState<(typeof productStatuses)[number] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function applyStatus(next: (typeof productStatuses)[number], { isUndo = false }: { isUndo?: boolean } = {}) {
    const current = optimisticStatus;
    setErrorMessage(null);

    startTransition(async () => {
      setOptimisticStatus(next);

      const formData = new FormData();
      formData.set("productId", product.id);
      formData.set("status", next);

      const result = await quickUpdateProductStatusAction({}, formData);

      if (result.error) {
        setErrorMessage(result.error);
        setOptimisticStatus(current);
        return;
      }

      setPreviousStatus(isUndo ? null : current);
      // Soft-refresh: tidak reload penuh, hanya re-fetch data server component
      // di background supaya daftar (mis. jumlah item per status) ikut sinkron.
      router.refresh();
    });
  }

  const isDone = isDoneProductStatus(optimisticStatus);
  const nextSteps = nextStepByStatus[optimisticStatus] ?? [];

  return (
    <article
      className={cn(
        "panel flex gap-4 p-4 transition-opacity duration-300",
        isDone && "opacity-50",
        isPending && "opacity-80"
      )}
    >
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        className="h-20 w-20 flex-shrink-0 rounded-2xl"
        fallbackLabel=""
        fallbackDescription=""
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {product.isRush ? (
            <Badge className="bg-rose-500 text-white font-bold animate-pulse shadow-sm">
              <Zap className="mr-1 h-3 w-3 fill-white" />
              RUSH
            </Badge>
          ) : null}
          {product.targetDay ? (
            <Badge className={eventDayBadgeStyles[product.targetDay]}>
              {eventDayShortLabels[product.targetDay]}
            </Badge>
          ) : null}
          <Badge className={priorityStyles[product.priority]}>{product.priority}</Badge>
          <Badge className={statusStyles[optimisticStatus]}>{optimisticStatus}</Badge>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="mt-2 block truncate font-[var(--font-display)] text-lg font-semibold leading-tight text-ink-900"
        >
          {product.name}
        </Link>

        <p className="mt-1 truncate text-sm text-ink-500">
          {product.circleName}
          {product.boothCode ? ` · Booth ${product.boothCode}` : ""}
        </p>

        <p className="mt-1 text-sm font-semibold text-ink-700">
          {formatCurrency(product.price)}
          <span className="font-normal text-ink-500"> x{product.quantity}</span>
        </p>

        {product.poPickupNotes ? (
          <div className="mt-2 rounded-xl border border-sky-200/80 bg-sky-50/70 p-2.5 text-xs text-sky-900">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sky-950">📦 Data Ambil PO:</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && product.poPickupNotes) {
                    navigator.clipboard.writeText(product.poPickupNotes);
                    toast.success("Catatan PO disalin!");
                  }
                }}
                className="rounded bg-sky-200/70 px-2 py-0.5 text-[11px] font-medium text-sky-900 transition hover:bg-sky-300"
              >
                Salin
              </button>
            </div>
            <p className="mt-1 font-mono text-xs">{product.poPickupNotes}</p>
          </div>
        ) : null}

        {errorMessage ? <p className="mt-1 text-xs text-rose-600">{errorMessage}</p> : null}

        {/*
          Undo TIDAK menggantikan tombol aksi utama — kalau begitu, sekali tap
          akan mengunci card sehingga aksi lanjutan (mis. tap "Buka PO" lalu
          langsung "Tandai dibeli") jadi tidak mungkin sebelum meng-undo dulu.
          Undo dirender sebagai chip TAMBAHAN di samping tombol status,
          keduanya tetap aktif bersamaan.
        */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!isDone ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => applyStatus("PURCHASED")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50 sm:flex-none"
              >
                <ShoppingBag className="h-4 w-4" />
                Tandai dibeli
              </button>
              {nextSteps.map((step) => (
                <button
                  key={step.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => applyStatus(step.value)}
                  className="rounded-full border border-line bg-white/80 px-3 py-2 text-xs font-medium text-ink-700 transition hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  {step.label}
                </button>
              ))}
            </>
          ) : null}
          {previousStatus ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => applyStatus(previousStatus, { isUndo: true })}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line bg-white/80 px-3 py-2 text-xs font-medium text-ink-700 transition hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Undo ke {previousStatus}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
