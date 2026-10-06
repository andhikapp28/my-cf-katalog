"use client";

import { useState } from "react";
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

  lines.push("📋 MY COMIPOCKET — WISHLIST & HUNTING CHECKLIST");
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
          title: `Wishlist ${eventName || "Comifuro"} — ComiPocket`,
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
        className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 font-mono text-xs font-bold uppercase text-white shadow-soft hover:bg-brand-600 transition-all active:scale-95"
      >
        <Share2 className="h-4 w-4" />
        <span>Share Wishlist</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-line bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-ink-900">
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
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Textarea Preview */}
            <div className="flex-1 overflow-auto rounded-2xl border border-line bg-zinc-50/80 p-3.5">
              <pre className="font-mono text-xs text-ink-900 whitespace-pre-wrap leading-relaxed select-all">
                {textToShare}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-line px-4 py-2 font-mono text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-brand-600 active:scale-95"
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
