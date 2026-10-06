"use client";

import { useState } from "react";
import { AlertTriangle, Banknote, CheckCircle2, ChevronDown, ChevronUp, CreditCard, DollarSign, Info, ShieldAlert, Sparkles, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { calculateAtmCashReadiness } from "@/lib/wishlist";
import type { WishlistSummary } from "@/lib/wishlist";

export function CashReadinessCalculator({
  summary,
  className
}: {
  summary: WishlistSummary;
  className?: string;
}) {
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [showAtmTips, setShowAtmTips] = useState<boolean>(false);

  // Kalkulasi kesiapan ATM ICE BSD
  const atmStatus = calculateAtmCashReadiness(summary.requiredCash, cashInHand);

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setCashInHand(raw ? parseInt(raw, 10) : 0);
  };

  const handleQuickAdd = (amount: number) => {
    setCashInHand((prev) => prev + amount);
  };

  return (
    <section className={`panel overflow-hidden border border-brand-500/30 bg-gradient-to-br from-card via-[#FFF9F3] to-[#FFF4E8] p-5 shadow-soft md:p-7 ${className || ""}`}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-brand-500/15 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white shadow-xs">
              <Banknote className="h-4 w-4" />
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-600">
              Venue Resilience · Offline Safe
            </p>
          </div>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-black tracking-tight text-ink-900">
            Kalkulator Kesiapan Tunai ATM ICE BSD
          </h2>
          <p className="text-xs sm:text-sm text-ink-500">
            Antisipasi sinyal seluler macet total & QRIS timeout di dalam hall konvensi dengan persiapan uang tunai fisik.
          </p>
        </div>

        <div className="shrink-0">
          {atmStatus.isSufficient ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
              Cash Dompet Cukup!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F84632] px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-xs animate-pulse">
              <AlertTriangle className="h-4 w-4" />
              Perlu Tarik ATM ICE BSD
            </span>
          )}
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Estimasi Belanja */}
        <div className="rounded-2xl border border-line bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
              Total Target
            </span>
            <DollarSign className="h-4 w-4 text-brand-500" />
          </div>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-black text-ink-900 sm:text-3xl">
            {formatCurrency(summary.totalPrice)}
          </p>
          <p className="mt-1 text-[11px] text-ink-500">
            {summary.totalItems} karya ({summary.totalQuantity} pcs)
          </p>
        </div>

        {/* Sudah Dibelanjakan */}
        <div className="rounded-2xl border border-line bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Sudah Dibeli (✓)
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-black text-emerald-700 sm:text-3xl">
            {formatCurrency(summary.purchasedTotal)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-800">
            Tersimpan di checklist offline
          </p>
        </div>

        {/* Sisa Target Belanja */}
        <div className="rounded-2xl border border-line bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
              Sisa Belanja
            </span>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-black text-ink-900 sm:text-3xl">
            {formatCurrency(summary.remainingTotal)}
          </p>
          <p className="mt-1 text-[11px] text-ink-500">
            {summary.preOrderTotal > 0 ? `Termasuk PO: ${formatCurrency(summary.preOrderTotal)}` : "Semua item aktif"}
          </p>
        </div>

        {/* Kebutuhan Cash On-the-spot di Venue */}
        <div className="rounded-2xl border-2 border-brand-500 bg-brand-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between text-brand-700">
            <span className="font-mono text-[11px] font-black uppercase tracking-wider">
              Cash Venue Wajib
            </span>
            <Banknote className="h-4 w-4 text-brand-600" />
          </div>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-black text-brand-700 sm:text-3xl">
            {formatCurrency(summary.requiredCash)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-brand-600">
            Item OTS yang belum dibeli
          </p>
        </div>
      </div>

      {/* Interactive Cash Simulator */}
      <div className="mt-6 rounded-2xl border border-brand-500/25 bg-white p-5 shadow-xs">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          {/* Input Cash in Hand */}
          <div className="space-y-3 md:col-span-6">
            <div className="flex items-center justify-between">
              <label htmlFor="cashInHandInput" className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-brand-600" />
                Uang Tunai di Dompet Saat Ini:
              </label>
              {cashInHand > 0 && (
                <button
                  type="button"
                  onClick={() => setCashInHand(0)}
                  className="font-mono text-[11px] text-brand-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-bold text-ink-500">
                Rp
              </span>
              <input
                id="cashInHandInput"
                type="text"
                inputMode="numeric"
                value={cashInHand ? cashInHand.toLocaleString("id-ID") : ""}
                onChange={handleCashChange}
                placeholder="0"
                className="w-full rounded-xl border border-line bg-card/60 pl-11 pr-4 py-2.5 font-mono text-base font-bold text-ink-900 placeholder:text-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-mono text-[10px] text-zinc-500 mr-1">Tambah cepat:</span>
              {[50000, 100000, 200000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="rounded-lg border border-line bg-zinc-50 px-2 py-1 font-mono text-[11px] font-semibold text-zinc-700 hover:bg-brand-50 hover:border-brand-500/40 hover:text-brand-700 transition-colors"
                >
                  +{val / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Result Recommendation */}
          <div className="rounded-xl border border-dashed border-brand-500/40 bg-[#FFFBF7] p-4 md:col-span-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-700">
              Hasil Kesiapan ATM ICE BSD:
            </p>

            {atmStatus.shortfall > 0 ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-ink-700">Kekurangan uang tunai:</span>
                  <span className="font-mono text-lg font-black text-[#F84632]">
                    {formatCurrency(atmStatus.shortfall)}
                  </span>
                </div>

                <div className="rounded-lg bg-white p-2.5 border border-line/80 space-y-1.5 text-xs">
                  <p className="font-semibold text-ink-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                    Rekomendasi Penarikan di Mesin ATM:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-ink-600 font-mono text-[11px]">
                    <div className="rounded bg-brand-50/50 p-1.5 border border-brand-100">
                      <p className="text-brand-900 font-bold">Pecahan 50.000:</p>
                      <p className="text-xs text-brand-700 font-extrabold mt-0.5">
                        {atmStatus.notes50k} lembar ({formatCurrency(atmStatus.recommendedWithdrawal50k)})
                      </p>
                    </div>
                    <div className="rounded bg-brand-50/50 p-1.5 border border-brand-100">
                      <p className="text-brand-900 font-bold">Pecahan 100.000:</p>
                      <p className="text-xs text-brand-700 font-extrabold mt-0.5">
                        {atmStatus.notes100k} lembar ({formatCurrency(atmStatus.recommendedWithdrawal100k)})
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-zinc-600">
                  ⚡ <strong>Tips Hari-H:</strong> Tarik uang tunai di luar venue ICE BSD (Stasiun Rawa Buntu / Cisauk) untuk menghindari antrean panjang & kehabisan saldo mesin ATM.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                <p className="font-mono text-base font-extrabold text-emerald-700">
                  ✓ Uang Tunai di Dompet Mencukupi!
                </p>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Kamu sudah memiliki uang tunai {formatCurrency(cashInHand)} yang melebihi kebutuhan belanja venue on-the-spot ({formatCurrency(summary.requiredCash)}). Kamu siap berburu tanpa khawatir sinyal blank spot!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accordion / Drawer Tips ATM ICE BSD */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowAtmTips(!showAtmTips)}
          className="flex w-full items-center justify-between rounded-xl border border-brand-500/20 bg-white/60 px-4 py-2.5 text-left text-xs font-mono font-bold text-brand-700 hover:bg-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-600" />
            Panduan Darurat Uang Tunai & Titik ATM Sekitar ICE BSD
          </span>
          {showAtmTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAtmTips && (
          <div className="mt-2 rounded-xl border border-line bg-white p-4 text-xs leading-relaxed text-zinc-700 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-start gap-2 text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">Peringatan Cellular Congestion (Blank Spot ICE BSD):</p>
                <p className="mt-0.5 text-[11px] text-amber-900">
                  Dengan 40.000+ pengunjung berkumpul di Hall 8–10, BTS seluler mengalami overload parah. Transaksi QRIS sering terpotong di saldo pembeli tetapi tidak terkonfirmasi di HP seller. Membawa uang pas tunai adalah metode transaksi paling cepat & anti-kecewa.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="rounded-lg bg-zinc-50 p-2.5 border border-line">
                <p className="font-bold text-ink-900">1. Stasiun KRL (Rekomendasi 1)</p>
                <p className="mt-1 text-zinc-600">
                  ATM Center Stasiun Cisauk atau Rawa Buntu. Tarik sebelum naik shuttle bus atau ojek online ke ICE.
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2.5 border border-line">
                <p className="font-bold text-ink-900">2. ICE BSD Mezzanine</p>
                <p className="mt-1 text-zinc-600">
                  Terletak di selasar lobby Hall 3A & Nusantara Hall. Bersiap antrean 30–60 menit saat jam makan siang.
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2.5 border border-line">
                <p className="font-bold text-ink-900">3. The Breeze & AEON BSD</p>
                <p className="mt-1 text-zinc-600">
                  Pusat ATM lengkap di The Breeze BSD (~5 menit dari venue). Solusi terbaik jika ATM venue kehabisan stok uang.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
