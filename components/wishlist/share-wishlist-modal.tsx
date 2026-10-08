"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import type { BoothGroup } from "./types";
import type { WishlistSummary } from "@/lib/wishlist";

export function generateWishlistSummaryText({
  eventName,
  boothGroups,
  summary,
  purchasedIds
}: {
  eventName?: string;
  boothGroups: BoothGroup[];
  summary: WishlistSummary;
  purchasedIds: Set<string>;
}): string {
  const lines: string[] = [];
 
  lines.push("📋 MY COMIPOCKET - WISHLIST & HUNTING CHECKLIST");
  lines.push(`Event: ${eventName || "Comic Frontier (Comifuro) ICE BSD"}`);
  lines.push("─".repeat(42));
  lines.push(`🎯 Target Belanja: ${summary.totalItems} Karya (${summary.totalQuantity} pcs) · ${formatCurrency(summary.totalPrice)}`);
  lines.push(`💵 Kebutuhan Cash Fisik Venue: ${formatCurrency(summary.requiredCash)}`);
  lines.push(`✓ Progress Hunting: ${summary.purchasedTotal > 0 ? `${formatCurrency(summary.purchasedTotal)} (${summary.totalItems - summary.remainingTotal === 0 ? "Selesai" : "Sedang Berburu"})` : "Belum ada yang dibeli"}`);
  lines.push("─".repeat(42));
  lines.push("");
  lines.push("📍 RUTE BOOTH & DAFTAR KARYA:");

  boothGroups.forEach((group, index) => {
    const hall = group.hall || "Hall ICE";
    const booth = group.boothCode || "-";
    lines.push(`\n${index + 1}. [${hall} · Booth ${booth}] ${group.circleName}`);

    group.items.forEach((item) => {
      const isBought = purchasedIds.has(item.id);
      const mark = isBought ? "✓" : "[ ]";
      const rushTag = item.isRush ? " [⚡ RUSH 10:00]" : "";
      const poTag = item.purchaseType === "PO" ? " (PO)" : "";
      lines.push(`   ${mark} ${item.name} - ${formatCurrency(item.price)}${rushTag}${poTag}`);
    });
  });

  lines.push("");
  lines.push("─".repeat(42));
  lines.push("💡 Dibuat dengan ComiPocket (100% Offline-ready Companion Comifuro)");
  lines.push("https://comipocket.app/wishlist");

  return lines.join("\n");
}

export function ShareWishlistModal({
  eventName,
  boothGroups,
  summary,
  purchasedIds
}: {
  eventName?: string;
  boothGroups: BoothGroup[];
  summary: WishlistSummary;
  purchasedIds: Set<string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const textToShare = generateWishlistSummaryText({
    eventName,
    boothGroups,
    summary,
    purchasedIds
  });

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Wishlist ${eventName || "Comifuro"} - ComiPocket`,
          text: textToShare
        });
        toast.success("Berhasil dibagikan!");
        return;
      } catch (err: unknown) {
        // Jika user membatalkan share dialog, jangan buka modal error
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: buka modal preview teks
    setIsOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      toast.success("Ringkasan wishlist disalin ke clipboard!", {
        description: "Siap dipaste ke WhatsApp, Discord, X/Twitter, atau Notes."
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin teks ke clipboard.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Bagikan ringkasan wishlist"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 font-mono text-xs font-bold uppercase text-white shadow-soft hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-all active:scale-[0.98]"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        <span>Share Wishlist</span>
      </button>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-wishlist-title"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-line bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 id="share-wishlist-title" className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-ink-900">
                    Share Hunting Wishlist
                  </h3>
                  <p className="font-mono text-[11px] text-ink-500">
                    Ringkasan rute belanja siap dibagikan ke teman atau grup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup dialog share"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl border border-line bg-zinc-50/80 p-3.5">
              <pre className="font-mono text-xs text-ink-900 whitespace-pre-wrap leading-relaxed select-all">
                {textToShare}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-[44px] items-center rounded-xl border border-line px-4 py-2 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Berhasil Disalin!" : "Salin Teks Ringkasan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
