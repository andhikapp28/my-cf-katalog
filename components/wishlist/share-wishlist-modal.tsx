"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";
import type { CatalogCircle } from "@/db/queries";

export function generateSavedCirclesShareText({
  eventName,
  circles
}: {
  eventName?: string;
  circles: CatalogCircle[];
}): string {
  const lines: string[] = [];

  lines.push("DAFTAR CIRCLE INCARAN SAYA");
  lines.push(`Event: ${eventName || "Comic Frontier (Comifuro) ICE BSD"}`);
  lines.push("-".repeat(40));
  lines.push(`Total: ${circles.length} Circle Terpilih`);
  lines.push("");
  lines.push("RUTE BOOTH & DAFTAR CIRCLE:");

  circles.forEach((circle, index) => {
    const booth = circle.boothCode || "TBA";
    const day =
      circle.day === "DAY_1"
        ? "Day 1 (Sabtu)"
        : circle.day === "DAY_2"
          ? "Day 2 (Minggu)"
          : "Both Days";

    lines.push(`\n${index + 1}. [Booth ${booth} · ${day}] ${circle.name}`);
    if (circle.fandom) {
      lines.push(`   Fandom: ${circle.fandom}`);
    }
  });

  lines.push("");
  lines.push("-".repeat(40));
  lines.push("Dibuat dengan ComiPocket (Offline-Ready Companion Comifuro)");

  return lines.join("\n");
}

export function ShareWishlistModal({
  eventName,
  circles
}: {
  eventName?: string;
  circles: CatalogCircle[];
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

  const shareText = generateSavedCirclesShareText({
    eventName,
    circles
  });

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      toast.success("Rute circle berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin rute circle.");
    }
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Rute Hunting ${eventName || "Comifuro"}`,
          text: shareText
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#111215] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#D6F834] hover:text-[#111215] active:scale-[0.98] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
      >
        <Share2 className="h-4 w-4" />
        <span>Bagikan Rute ({circles.length})</span>
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bagikan Rute Circle Incaran"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  EXPORT &amp; SHARE ROUTE
                </span>
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
                  Bagikan Rute Circle Incaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup modal"
                className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Salin ringkasan rute meja stan dan daftar circle yang kamu tandai untuk dikirim ke teman hunting lewat WhatsApp, X (Twitter), atau catatan ponsel.
            </p>

            <div className="relative">
              <textarea
                readOnly
                value={shareText}
                rows={9}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 font-mono text-xs text-zinc-800 leading-relaxed focus:outline-none select-all resize-none shadow-inner"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#111215] px-6 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#D6F834] hover:bg-zinc-800 transition active:scale-[0.98] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
              >
                {copied ? <Check className="h-4 w-4 text-[#D6F834]" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Tersalin!" : "Salin ke Clipboard"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
