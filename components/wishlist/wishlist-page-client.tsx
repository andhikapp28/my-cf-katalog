"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Heart,
  Search,
  Store,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import {
  clearWishlist,
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  isCircleInWishlist,
  subscribeWishlist
} from "@/lib/wishlist";
import { compareBoothCodes } from "@/lib/floor-map";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CompactCircleCard,
  type CompactCircleItem
} from "@/components/products/compact-circle-card";
import { CircleCatalogModal } from "@/components/products/circle-catalog-modal";
import { ShareWishlistModal } from "./share-wishlist-modal";
import { WishlistCashCalculator } from "./wishlist-cash-calculator";
import type { CatalogCircle } from "@/db/queries";

export function WishlistPageClient({
  allCircles = [],
  activeEventName = "Comic Frontier 22 (Comifuro 22)"
}: {
  allCircles: CatalogCircle[];
  activeEventName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState<"ALL" | "DAY_1" | "DAY_2">("ALL");
  const [sortBy, setSortBy] = useState<"booth" | "name">("booth");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCircle, setSelectedCircle] = useState<CompactCircleItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawWishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const wishlistIds = useMemo(
    () => (mounted ? rawWishlistIds : []),
    [mounted, rawWishlistIds]
  );

  const savedCircles = useMemo(() => {
    if (wishlistIds.length === 0) return [];

    const idSet = new Set(wishlistIds);
    return allCircles.filter((circle) => {
      const productIds = circle.products?.map((p) => p.id) || [];
      return isCircleInWishlist(circle.id, productIds, idSet);
    });
  }, [allCircles, wishlistIds]);

  const filteredCircles = useMemo(() => {
    let result = savedCircles;

    if (activeDay === "DAY_1") {
      result = result.filter(
        (c) => !c.day || c.day === "ALL_DAYS" || c.day === "DAY_1"
      );
    } else if (activeDay === "DAY_2") {
      result = result.filter(
        (c) => !c.day || c.day === "ALL_DAYS" || c.day === "DAY_2"
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.boothCode && c.boothCode.toLowerCase().includes(q)) ||
          (c.fandom && c.fandom.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return compareBoothCodes(a.boothCode, b.boothCode);
    });
  }, [savedCircles, activeDay, sortBy, searchQuery]);

  const dayCounts = useMemo(() => {
    return {
      ALL: savedCircles.length,
      DAY_1: savedCircles.filter(
        (c) => !c.day || c.day === "ALL_DAYS" || c.day === "DAY_1"
      ).length,
      DAY_2: savedCircles.filter(
        (c) => !c.day || c.day === "ALL_DAYS" || c.day === "DAY_2"
      ).length
    };
  }, [savedCircles]);

  const handleClearAll = () => {
    if (savedCircles.length === 0) return;
    if (
      window.confirm(
        "Hapus semua circle tersimpan? Daftar bookmark circle incaranmu di browser ini akan dikosongkan."
      )
    ) {
      clearWishlist();
      toast.success("Daftar circle tersimpan telah dikosongkan.");
    }
  };

  return (
    <div className="container-shell space-y-8 py-8 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Link href="/" className="transition hover:text-zinc-900 font-medium">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-400" />
        <span className="font-bold text-zinc-900">Circle Tersimpan</span>
      </nav>

      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-6 sm:pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F84632]/25 bg-[#F84632]/10 px-3 py-1 shadow-xs">
            <span className="font-mono text-xs font-bold tracking-widest text-[#F84632] uppercase">
              SAVED BOOKMARKS · ICE BSD
            </span>
          </div>

          <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#111215] leading-[0.92]">
            CIRCLE TERSIMPAN &amp; RUTE KUNJUNGAN<span className="text-[#F84632]">*</span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-[#111215]/80">
            Daftar stan circle kreator dan nomor meja booth incaranmu untuk {activeEventName}. Disimpan langsung di browser dan siap diakses secara offline di dalam hall venue tanpa koneksi internet.
          </p>
        </div>

        {savedCircles.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <ShareWishlistModal
              eventName={activeEventName}
              circles={filteredCircles}
            />

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-rose-600 hover:bg-rose-50 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-2xs"
              title="Kosongkan seluruh circle tersimpan"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
          </div>
        ) : null}
      </div>

      {savedCircles.length > 0 ? (
        <div className="space-y-6">
          {/* Wishlist Cash Calculator & Budget Planner */}
          <WishlistCashCalculator
            savedCircles={savedCircles}
            activeEventName={activeEventName}
          />

          {/* 2. Filter & Sort Toolbar */}
          <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Day Filter Chips */}
              <div role="tablist" aria-label="Filter hari kehadiran" className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 mr-1">
                  HARI:
                </span>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeDay === "ALL"}
                  onClick={() => setActiveDay("ALL")}
                  className={cn(
                    "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
                    activeDay === "ALL"
                      ? "bg-[#111215] text-[#D6F834] border-[#111215] shadow-xs"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  <span>Semua</span>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    activeDay === "ALL" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {dayCounts.ALL}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeDay === "DAY_1"}
                  onClick={() => setActiveDay("DAY_1")}
                  className={cn(
                    "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
                    activeDay === "DAY_1"
                      ? "bg-[#5398DA] text-[#111215] font-black border-[#5398DA] shadow-xs"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-[#5398DA]/50 hover:text-[#5398DA]"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Day 1 (Sabtu)</span>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    activeDay === "DAY_1" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {dayCounts.DAY_1}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeDay === "DAY_2"}
                  onClick={() => setActiveDay("DAY_2")}
                  className={cn(
                    "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
                    activeDay === "DAY_2"
                      ? "bg-[#D6F834] text-[#111215] border-[#D6F834] shadow-xs"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-[#D6F834] hover:bg-[#D6F834]/10"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Day 2 (Minggu)</span>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    activeDay === "DAY_2" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {dayCounts.DAY_2}
                  </span>
                </button>
              </div>

              {/* Search Inside Bookmarks */}
              <div className="relative sm:w-72">
                <Search className="absolute inset-y-0 left-3 my-auto h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari di circle tersimpan..."
                  aria-label="Cari di circle tersimpan"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#111215] focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] transition"
                />
              </div>
            </div>

            {/* Sub-bar: Count & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
              <span className="font-mono text-xs font-bold text-zinc-700">
                Menampilkan <strong className="text-[#F84632] font-mono">{filteredCircles.length}</strong> Circle Incaran
              </span>

              <div className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xs">
                <span className="px-2 text-[11px] font-mono font-bold uppercase text-zinc-400">
                  URUTKAN:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("booth")}
                  className={cn(
                    "rounded-xl px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition",
                    sortBy === "booth"
                      ? "bg-[#111215] text-[#D6F834]"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  Rute Meja (Booth)
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("name")}
                  className={cn(
                    "rounded-xl px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition",
                    sortBy === "name"
                      ? "bg-[#111215] text-[#D6F834]"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  Nama Circle
                </button>
              </div>
            </div>
          </div>

          {/* 3. Bookmarked Circle Cards Grid */}
          {filteredCircles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCircles.map((circle) => (
                <CompactCircleCard
                  key={circle.id}
                  circle={circle as unknown as CompactCircleItem}
                  onSelectCircle={(c) => setSelectedCircle(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Tidak ada circle yang cocok"
              description="Tidak ada circle tersimpan yang sesuai dengan kata kunci pencarian atau filter hari yang dipilih."
            />
          )}
        </div>
      ) : (
        /* 4. Empty State When Zero Circles Saved */
        <div className="rounded-3xl border-2 border-dashed border-zinc-300 p-10 sm:p-16 text-center space-y-6 max-w-2xl mx-auto bg-white/70 shadow-xs">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F84632]/10 text-[#F84632] shadow-sm">
            <Heart className="h-10 w-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-[var(--font-display)] text-3xl font-black text-[#111215] sm:text-4xl uppercase tracking-tight">
              Belum Ada Circle Tersimpan
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto font-medium">
              Tandai circle kreator incaranmu dengan menekan tombol hati pada kartu circle di direktori untuk menyusun rute hunting saat hari-H.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/circles"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#111215] px-6 py-3 font-mono text-xs font-bold uppercase text-[#D6F834] shadow-sm hover:bg-zinc-800 transition active:scale-[0.98]"
            >
              <Store className="h-4 w-4" />
              <span>Jelajahi Direktori Circle</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-zinc-200 text-xs text-zinc-500 space-y-1 font-mono">
            <p className="font-bold text-zinc-700">100% Client Storage · Bebas Login Akun</p>
            <p>Daftar circle tersimpan otomatis di browser ponselmu dan siap dibuka offline di venue ICE BSD.</p>
          </div>
        </div>
      )}

      {/* 5. Interactive Circle Catalog Modal */}
      <CircleCatalogModal
        circle={selectedCircle}
        isOpen={Boolean(selectedCircle)}
        onClose={() => setSelectedCircle(null)}
      />
    </div>
  );
}
