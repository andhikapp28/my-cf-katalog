"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookmarkCheck,
  Clock,
  MapPin,
  ShoppingBag,
  Store,
  Wallet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { priorityStyles, statusStyles } from "@/lib/constants";

export interface EventPlannerSummary {
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  highPriorityItems: Array<{
    id: string;
    name: string;
    price: number;
    status: "PURCHASED" | "TARGET" | "PO_OPEN" | "PO_DONE" | "CANCELLED" | "SOLD_OUT";
    priority: "LOW" | "MEDIUM" | "HIGH";
    circle: {
      id: string;
      name: string;
    };
  }>;
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    poDeadline: string | Date | null;
    circle: {
      id: string;
      name: string;
    };
  }>;
  priorityCircles: Array<{
    circleId: string;
    circleName: string;
    boothCode: string;
    floorMapId: string | null;
  }>;
  trackedItemsCount: number;
  trackedCirclesCount: number;
}

interface CompanionPlannerProps {
  eventId: string;
  eventBudget: number;
  summary: EventPlannerSummary;
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function EventCompanionPlanner({
  eventId,
  eventBudget,
  summary
}: CompanionPlannerProps) {
  const budgetUsage = Math.min(
    100,
    Math.round((summary.totalActual / Math.max(eventBudget, 1)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* 1. FINANCIAL BUDGET TRACKER */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
              <Wallet className="h-4 w-4 text-zinc-800" />
              <span>KALKULASI PENGELUARAN &amp; BUDGET BELANJA</span>
            </div>
            <h3 className="mt-1 font-[var(--font-display)] text-2xl font-black uppercase tracking-tight text-zinc-900">
              Budget Meter &amp; Tracking Khilaf
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">
              Pemakaian Budget:
            </span>
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-black ${
                budgetUsage > 90
                  ? "bg-rose-100 text-rose-800"
                  : "bg-[#D6F834] text-[#111215]"
              }`}
            >
              {budgetUsage}%
            </span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              TARGET BUDGET
            </span>
            <p className="mt-2 font-mono text-xl font-black text-zinc-900">
              {formatCurrency(eventBudget)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Batas pengeluaran maksimal event
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              TOTAL PLANNED
            </span>
            <p className="mt-2 font-mono text-xl font-black text-zinc-900">
              {formatCurrency(summary.totalEstimated)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Estimasi total dari wishlist
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              ACTUAL EXPENSE
            </span>
            <p className="mt-2 font-mono text-xl font-black text-zinc-900">
              {formatCurrency(summary.totalActual)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Sudah dibeli / pre-order lunas
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              SISA BUDGET
            </span>
            <p
              className={`mt-2 font-mono text-xl font-black ${
                summary.remainingBudget >= 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {formatCurrency(summary.remainingBudget)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {summary.remainingBudget >= 0
                ? "Alokasi masih aman"
                : "Melebihi alokasi budget"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. PRIORITY ITEMS & PO DEADLINES */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Items Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h4 className="font-[var(--font-display)] text-lg font-black uppercase text-zinc-900">
                  Target Prioritas Tinggi
                </h4>
                <p className="text-xs text-zinc-500">
                  Karya incaran utama saat gerbang booth dibuka
                </p>
              </div>
              <Link
                href={`/products?eventId=${eventId}&priority=HIGH`}
                className="font-mono text-xs font-bold text-zinc-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {summary.highPriorityItems.length > 0 ? (
              <div className="space-y-3">
                {summary.highPriorityItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 transition hover:border-zinc-900 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className={statusStyles[item.status]}>
                          {formatStatusLabel(item.status)}
                        </Badge>
                        <Badge className={priorityStyles[item.priority]}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 font-bold text-zinc-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.circle.name}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-zinc-900 shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center space-y-3">
                <BookmarkCheck className="h-8 w-8 text-zinc-400 mx-auto" />
                <p className="font-bold text-sm text-zinc-700">
                  Belum ada item prioritas tinggi
                </p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Tandai produk favorit dengan status prioritas HIGH pada katalog karya agar muncul di daftar cepat ini.
                </p>
                <Link
                  href={`/products?eventId=${eventId}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#111215] px-4 py-2 font-mono text-xs font-bold text-white transition hover:bg-[#D6F834] hover:text-[#111215]"
                >
                  <span>Buka Katalog Karya</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* PO Deadlines Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h4 className="font-[var(--font-display)] text-lg font-black uppercase text-zinc-900">
                  Batas Waktu Pre-Order (PO)
                </h4>
                <p className="text-xs text-zinc-500">
                  Pantau deadline pemesanan agar tidak kehabisan kuota
                </p>
              </div>
              <Link
                href={`/products?eventId=${eventId}`}
                className="font-mono text-xs font-bold text-zinc-900 hover:underline inline-flex items-center gap-1"
              >
                <span>Katalog Karya</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {summary.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {summary.upcomingDeadlines.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 transition hover:border-zinc-900 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.circle.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-bold text-rose-700">
                        {formatDate(item.poDeadline)}
                      </p>
                      <span className="font-mono text-[10px] uppercase text-zinc-400">
                        DEADLINE
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center space-y-3">
                <Clock className="h-8 w-8 text-zinc-400 mx-auto" />
                <p className="font-bold text-sm text-zinc-700">
                  Tidak ada deadline aktif
                </p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Belum ada item pesanan yang memiliki tenggat waktu pre-order untuk edisi ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. TRACKED CIRCLES & QUICK ACTIONS */}
      <div className="rounded-3xl border border-zinc-200 bg-[#111215] text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#D6F834]">
              AKSES CEPAT VENUE &amp; BOOTH
            </p>
            <h4 className="mt-1 font-[var(--font-display)] text-xl font-black uppercase tracking-tight text-white">
              Shortcut Navigasi ComiPocket
            </h4>
          </div>
          <span className="font-mono text-xs text-white/70">
            {summary.trackedCirclesCount} Circle Terpantau
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/products?eventId=${eventId}`}
            className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-[#D6F834] hover:text-[#111215] hover:border-[#D6F834]"
          >
            <ShoppingBag className="h-5 w-5 mb-2" />
            <p className="font-bold text-sm">Katalog Karya</p>
            <p className="text-xs text-white/60">Jelajahi karya kreator</p>
          </Link>

          <Link
            href="/maps"
            className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-[#D6F834] hover:text-[#111215] hover:border-[#D6F834]"
          >
            <MapPin className="h-5 w-5 mb-2" />
            <p className="font-bold text-sm">Peta Denah Booth</p>
            <p className="text-xs text-white/60">Denah hall ICE BSD</p>
          </Link>

          <Link
            href="/wishlist"
            className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-[#D6F834] hover:text-[#111215] hover:border-[#D6F834]"
          >
            <BookmarkCheck className="h-5 w-5 mb-2" />
            <p className="font-bold text-sm">Checklist Belanja</p>
            <p className="text-xs text-white/60">Wishlist &amp; kalkulator</p>
          </Link>

          <Link
            href="/circles"
            className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-[#D6F834] hover:text-[#111215] hover:border-[#D6F834]"
          >
            <Store className="h-5 w-5 mb-2" />
            <p className="font-bold text-sm">Direktori Circle</p>
            <p className="text-xs text-white/60">Daftar semua kreator</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
