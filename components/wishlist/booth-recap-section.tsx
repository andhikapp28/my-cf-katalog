"use client";

import Link from "next/link";
import { Check, CheckCircle2, ChevronRight, MapPin, Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/products/product-image";
import { formatCurrency } from "@/lib/format";
import {
  eventDayBadgeStyles,
  eventDayShortLabels
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BoothGroup } from "./types";

export function BoothRecapSection({
  boothGroups,
  purchasedIds,
  onTogglePurchased,
  onRemoveItem
}: {
  boothGroups: BoothGroup[];
  purchasedIds: Set<string>;
  onTogglePurchased: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
}) {
  if (boothGroups.length === 0) {
    return (
      <div className="panel p-8 text-center text-ink-500">
        <p className="font-mono text-sm">Tidak ada booth atau karya yang sesuai dengan filter ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-600">
            Venue Hunting Route
          </p>
          <h3 className="font-[var(--font-display)] text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            Rekap Booth & Checklist Hari-H ({boothGroups.length} Booth)
          </h3>
        </div>
        <p className="hidden font-mono text-xs text-ink-500 sm:block">
          Diurutkan otomatis: Hall ➔ Lorong ➔ No. Meja
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {boothGroups.map((group) => {
          const purchasedCount = group.items.filter((item) =>
            purchasedIds.has(item.id)
          ).length;
          const totalCount = group.items.length;
          const isAllDone = purchasedCount === totalCount && totalCount > 0;

          return (
            <div
              key={`${group.circleId}-${group.boothCode}`}
              className={cn(
                "panel overflow-hidden border transition-all duration-200",
                isAllDone
                  ? "border-emerald-300 bg-emerald-50/20 opacity-90"
                  : group.hasRush
                    ? "border-rose-300/80 bg-rose-50/10 shadow-soft"
                    : "border-line bg-card/90"
              )}
            >
              {/* Booth Group Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 bg-white/70 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Hall Badge */}
                  <span className="rounded-md bg-[#5398DA] px-2.5 py-1 font-mono text-xs font-black uppercase text-white shadow-xs">
                    {group.hall || "Hall ICE"}
                  </span>

                  {/* Booth Code Badge */}
                  <span className="rounded-md bg-[#111215] px-2.5 py-1 font-mono text-xs font-black tracking-wider text-[#D6F834] shadow-xs">
                    Booth {group.boothCode || "-"}
                  </span>

                  {/* Circle Name */}
                  <Link
                    href={`/circles/${group.circleId}`}
                    className="font-bold text-ink-900 hover:text-brand-700 hover:underline text-base sm:text-lg flex items-center gap-1.5"
                  >
                    <span>{group.circleName}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>

                  {group.hasRush && !isAllDone && (
                    <Badge className="bg-rose-500 text-white font-bold animate-pulse text-[10px] px-2 py-0.5">
                      <Zap className="mr-0.5 h-3 w-3 fill-white" />
                      RUSH 10:00
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Progress Counter */}
                  <span
                    className={cn(
                      "font-mono text-xs font-bold px-2.5 py-1 rounded-full",
                      isAllDone
                        ? "bg-emerald-100 text-emerald-800 font-extrabold"
                        : "bg-zinc-100 text-zinc-700"
                    )}
                  >
                    {isAllDone ? "✓ Booth Selesai" : `${purchasedCount}/${totalCount} Karya`}
                  </span>

                  {/* Link ke Denah Peta */}
                  {group.floorMapId ? (
                    <Link
                      href={`/maps/${group.floorMapId}?booth=${encodeURIComponent(group.boothCode)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 font-mono text-xs font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-500 transition-colors"
                      title="Lihat posisi booth di denah peta ICE BSD"
                    >
                      <MapPin className="h-3.5 w-3.5 text-brand-600" />
                      <span className="hidden sm:inline">Peta Denah</span>
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Items List Inside This Booth */}
              <div className="divide-y divide-line/60 p-2 sm:p-4">
                {group.items.map((item) => {
                  const isBought = purchasedIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between rounded-xl transition-colors duration-150",
                        isBought
                          ? "bg-emerald-50/40"
                          : "hover:bg-brand-50/30"
                      )}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line sm:h-20 sm:w-20">
                          <ProductImage
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            fallbackLabel="No pic"
                          />
                          {isBought && (
                            <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                              <CheckCircle2 className="h-7 w-7 text-white fill-emerald-600" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.isRush ? (
                              <Badge className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.2">
                                <Zap className="mr-0.5 h-2.5 w-2.5 fill-white" />
                                RUSH
                              </Badge>
                            ) : null}
                            {item.targetDay === "DAY_1" || item.targetDay === "DAY_2" ? (
                              <Badge className={cn("text-[9px] px-1.5 py-0.2", eventDayBadgeStyles[item.targetDay])}>
                                {eventDayShortLabels[item.targetDay]}
                              </Badge>
                            ) : null}
                            <Badge className="bg-zinc-100 text-zinc-700 text-[9px] px-1.5 py-0.2">
                              {item.purchaseType === "PO" ? "📦 Pre-Order" : "💵 On-The-Spot"}
                            </Badge>
                          </div>

                          <Link
                            href={`/products/${item.id}`}
                            className={cn(
                              "block font-bold text-ink-900 hover:text-brand-700 text-sm sm:text-base leading-snug line-clamp-2",
                              isBought && "line-through text-zinc-500"
                            )}
                          >
                            {item.name}
                          </Link>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="font-mono font-extrabold text-brand-700">
                              {formatCurrency(item.price)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="font-mono text-zinc-500">
                                × {item.quantity} pcs ({formatCurrency(item.price * item.quantity)})
                              </span>
                            )}
                            {item.poPickupNotes && (
                              <span className="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-800">
                                PO: {item.poPickupNotes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Interactive Checklist Tap & Remove Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Tap to Toggle Checklist */}
                        <button
                          type="button"
                          onClick={() => onTogglePurchased(item.id)}
                          data-testid={`checklist-toggle-${item.id}`}
                          aria-label={isBought ? "Batalkan tanda beli" : "Tandai sudah dibeli"}
                          className={cn(
                            "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-black uppercase transition-all duration-150 active:scale-95 shadow-xs select-none",
                            isBought
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30"
                              : "border-2 border-[#F84632] bg-white text-[#F84632] hover:bg-[#F84632] hover:text-white"
                          )}
                        >
                          {isBought ? (
                            <>
                              <Check className="h-4 w-4 stroke-[3]" />
                              <span>✓ Dibeli</span>
                            </>
                          ) : (
                            <>
                              <span className="inline-block h-3.5 w-3.5 rounded border-2 border-current" />
                              <span>[ ] Beli</span>
                            </>
                          )}
                        </button>

                        {/* Remove from wishlist */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label="Hapus dari Wishlist"
                          title="Hapus karya dari Wishlist"
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line bg-white text-zinc-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
