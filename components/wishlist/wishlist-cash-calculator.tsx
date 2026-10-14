"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  Coins,
  Copy,
  ShieldAlert,
  Sparkles,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CatalogCircle } from "@/db/queries";

export interface WishlistCashCalculatorProps {
  savedCircles: CatalogCircle[];
  activeEventName?: string;
}

const BUDGET_PRESETS = [
  { label: "Ringan", value: 50000, desc: "Gantungan kunci / stiker pack" },
  { label: "Standar", value: 75000, desc: "Standee akrilik / print kecil" },
  { label: "Kolektor", value: 125000, desc: "Artbook / doujinshi komik" },
  { label: "Borong", value: 200000, desc: "Bundle merchandise komplit" }
];

export function WishlistCashCalculator({
  savedCircles,
  activeEventName = "Comic Frontier"
}: WishlistCashCalculatorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [avgSpendPerCircle, setAvgSpendPerCircle] = useState(75000);
  const bufferPercent = 15;

  const circleCount = savedCircles.length;

  const calculations = useMemo(() => {
    const rawMerch = circleCount * avgSpendPerCircle;
    const bufferAmount = Math.round((rawMerch * bufferPercent) / 100);
    const subtotal = rawMerch + bufferAmount;

    // Dibulatkan ke atas ke kelipatan Rp 50.000 (pecahan ATM umum)
    const atmWithdrawalTarget =
      subtotal > 0 ? Math.ceil(subtotal / 50000) * 50000 : 0;

    // Denominasi pecahan ATM
    const count100k = Math.floor(atmWithdrawalTarget / 100000);
    const remainder = atmWithdrawalTarget % 100000;
    const count50k = remainder >= 50000 ? 1 : 0;

    return {
      rawMerch,
      bufferAmount,
      subtotal,
      atmWithdrawalTarget,
      count100k,
      count50k
    };
  }, [circleCount, avgSpendPerCircle, bufferPercent]);

  const handleCopySummary = async () => {
    if (circleCount === 0) return;

    const summaryText = [
      `💰 RENCANA TARIK TUNAI & BUDGET HUNTING (${activeEventName})`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• Target Stan Circle: ${circleCount} Circle`,
      `• Rata-rata per Circle: Rp ${avgSpendPerCircle.toLocaleString("id-ID")}`,
      `• Estimasi Belanja Karya: Rp ${calculations.rawMerch.toLocaleString("id-ID")}`,
      `• Buffer Taktis (+${bufferPercent}% makan/transport): Rp ${calculations.bufferAmount.toLocaleString("id-ID")}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💵 REKOMENDASI TARIK TUNAI ATM: Rp ${calculations.atmWithdrawalTarget.toLocaleString("id-ID")}`,
      `  - ${calculations.count100k} lembar Rp 100.000`,
      calculations.count50k > 0 ? `  - ${calculations.count50k} lembar Rp 50.000` : "",
      `💡 Tips: Tukar Rp 50.000 ke uang kecil (Rp 10k/20k) di Indomaret ICE BSD sebelum masuk hall agar transaksi booth tanpa kendala kembalian!`
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success("Rencana budget tunai berhasil disalin ke clipboard!");
    } catch {
      toast.error("Gagal menyalin ringkasan budget.");
    }
  };

  if (circleCount === 0) return null;

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#D6F834] text-[#111215] shadow-xs">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#F84632]">
              <Banknote className="h-3 w-3" />
              <span>ANTI SINYAL BLACKOUT · ICE BSD</span>
            </div>
            <h2 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-[#111215] leading-none">
              KALKULATOR TARIK TUNAI &amp; ESTIMASI ATM
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 font-mono text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Sembunyikan kalkulator" : "Buka kalkulator"}
        >
          <span>{isOpen ? "Tutup" : "Buka"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Preset Buttons & Spend Input */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="spend-preset" className="text-xs font-bold font-mono uppercase text-zinc-700">
                Pilih Estimasi Belanja Per Circle ({circleCount} Circle Tersimpan):
              </label>
              <span className="text-xs font-mono text-zinc-500">
                Rp {avgSpendPerCircle.toLocaleString("id-ID")} / stan
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BUDGET_PRESETS.map((preset) => {
                const isActive = avgSpendPerCircle === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setAvgSpendPerCircle(preset.value)}
                    className={cn(
                      "flex flex-col text-left rounded-2xl border p-3 transition shadow-xs",
                      isActive
                        ? "border-[#111215] bg-[#111215] text-white"
                        : "border-zinc-200 bg-zinc-50/70 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-100/80"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs uppercase font-mono">{preset.label}</span>
                      {isActive && <Sparkles className="h-3 w-3 text-[#D6F834]" />}
                    </div>
                    <span className={cn("font-mono text-sm font-black mt-1", isActive ? "text-[#D6F834]" : "text-zinc-900")}>
                      Rp {(preset.value / 1000).toFixed(0)}k
                    </span>
                    <span className={cn("text-[10px] mt-0.5 leading-tight line-clamp-1", isActive ? "text-zinc-300" : "text-zinc-500")}>
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Breakdown & Cash Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Breakdown (5 cols) */}
            <div className="md:col-span-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-600">
                <span>Stan Circle:</span>
                <span className="font-bold text-zinc-900">{circleCount} stan</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Rata-rata / Circle:</span>
                <span className="font-bold text-zinc-900">Rp {avgSpendPerCircle.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Total Merchandise:</span>
                <span className="font-bold text-zinc-900">Rp {calculations.rawMerch.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <span>Dana Taktis (+{bufferPercent}%):</span>
                </span>
                <span className="font-bold text-amber-700">+Rp {calculations.bufferAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 flex items-center justify-between font-bold text-zinc-900">
                <span>Total Estimasi Kebutuhan:</span>
                <span>Rp {calculations.subtotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Right ATM Recommendation Highlight (7 cols) */}
            <div className="md:col-span-7 rounded-2xl border-2 border-[#111215] bg-[#111215] p-5 text-white flex flex-col justify-between space-y-4 shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D6F834]">
                    REKOMENDASI TARIK TUNAI ATM (PEMBULATAN KELIPATAN RP 50.000)
                  </span>
                  <Coins className="h-4 w-4 text-[#D6F834]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-[var(--font-display)] text-3xl sm:text-4xl font-black text-white">
                    Rp {calculations.atmWithdrawalTarget.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Uang Tunai Fisik</span>
                </div>
                <p className="mt-1 text-xs text-zinc-300">
                  Disarankan tarik di ATM:{" "}
                  <strong className="text-[#D6F834]">
                    {calculations.count100k} lembar Rp 100.000
                    {calculations.count50k > 0 ? ` + ${calculations.count50k} lembar Rp 50.000` : ""}
                  </strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#D6F834] px-4 py-2 font-mono text-xs font-black uppercase text-[#111215] transition hover:bg-[#cbf128] active:scale-[0.98] shadow-xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Rencana Budget ATM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Operational Venue Notice */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Kenapa uang tunai wajib dipersiapkan sebelum masuk ICE BSD?</strong>
              <p className="mt-0.5 text-amber-800 font-normal">
                Jaringan seluler di dalam hall ICE BSD kerap mengalami lonjakan trafik parah (*sinyal blackout*) yang menyebabkan mesin EDC dan QRIS mobile banking lambat atau gagal transaksi. Membawa uang pas menghindarkanmu dari kegagalan beli karya buruan edisi terbatas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
