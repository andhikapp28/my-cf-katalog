"use client";

import { useState } from "react";
import { Check, Copy, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PoPickupSlip({
  poPickupNotes,
  productName,
  className
}: {
  poPickupNotes: string;
  productName?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(poPickupNotes);
      }
      setCopied(true);
      toast.success(
        productName
          ? `Data PO untuk "${productName}" berhasil disalin!`
          : "Data pengambilan PO berhasil disalin!",
        {
          description: "Siap ditunjukkan atau ditempelkan saat klaim karya di venue ICE BSD."
        }
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin data PO ke clipboard.");
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed border-[#5398DA]/50 bg-[#5398DA]/5 p-5 sm:p-6 transition-colors duration-200",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#111215] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-[#D6F834]">
            <PackageCheck className="h-3 w-3 text-[#D6F834]" />
            <span>Slip Pengambilan PO</span>
          </div>
          <h3 className="font-[var(--font-display)] text-xl font-bold uppercase tracking-tight text-[#111215]">
            Bukti & Catatan Penukaran Pre-Order
          </h3>
          <p className="text-xs text-zinc-600 font-sans">
            Tunjukkan data atau kode ini kepada staf booth saat hari H penukaran di ICE BSD.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Salin data pengambilan PO"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.98] shadow-xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
            copied
              ? "bg-emerald-600 text-white"
              : "bg-[#111215] text-white hover:bg-[#F84632]"
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Salin Data PO</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-[#5398DA]/30 bg-white/95 p-4 shadow-xs">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
          Data Penukaran Booth:
        </p>
        <p className="font-mono text-sm sm:text-base font-bold text-[#111215] break-words select-all leading-relaxed">
          {poPickupNotes}
        </p>
      </div>
    </div>
  );
}
