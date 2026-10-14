"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, RotateCcw, Search, Sparkles, X } from "lucide-react";
import {
  CompactCircleCard,
  type CompactCircleItem
} from "@/components/products/compact-circle-card";
import { CircleCatalogModal } from "@/components/products/circle-catalog-modal";
import { compareBoothCodes, getCirclePrimaryBoothCode } from "@/lib/floor-map";
import { cn } from "@/lib/utils";
import type { CatalogCircle } from "@/db/queries";

export interface EventOption {
  slug: string;
  name: string;
  circleCount: number;
  isActive: boolean;
}

export interface CirclesDirectoryClientProps {
  initialCircles: CatalogCircle[];
  activeEventSlug: string;
  events: EventOption[];
}

const ITEMS_PER_PAGE = 24;

export function CirclesDirectoryClient({
  initialCircles,
  activeEventSlug,
  events
}: CirclesDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<"ALL" | "DAY_1" | "DAY_2">("ALL");
  const [sortBy, setSortBy] = useState<"booth" | "name" | "items">("booth");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCircle, setSelectedCircle] = useState<CompactCircleItem | null>(null);

  // Filter circles
  const filteredCircles = useMemo(() => {
    let result = [...initialCircles];

    // Filter by day
    if (selectedDay !== "ALL") {
      result = result.filter((circle) => {
        const dayStr = circle.day?.toUpperCase() || "";
        if (selectedDay === "DAY_1") {
          return dayStr.includes("1") || dayStr.includes("BOTH") || dayStr.includes("ALL");
        }
        if (selectedDay === "DAY_2") {
          return dayStr.includes("2") || dayStr.includes("BOTH") || dayStr.includes("ALL");
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((circle) => {
        const nameMatch = circle.name.toLowerCase().includes(q);
        const boothCode = circle.boothCode || getCirclePrimaryBoothCode(circle);
        const boothMatch = boothCode.toLowerCase().includes(q);
        const notesMatch = circle.notes?.toLowerCase().includes(q) ?? false;
        const fandomMatch =
          (circle.fandom?.toLowerCase().includes(q) ?? false) ||
          (circle.categories?.some((f) => f.toLowerCase().includes(q)) ?? false);

        return nameMatch || boothMatch || notesMatch || fandomMatch;
      });
    }

    // Sort circles
    result.sort((a, b) => {
      if (sortBy === "booth") {
        const boothA = a.boothCode || getCirclePrimaryBoothCode(a);
        const boothB = b.boothCode || getCirclePrimaryBoothCode(b);
        const boothDiff = compareBoothCodes(boothA, boothB);
        if (boothDiff !== 0) return boothDiff;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      if (sortBy === "items") {
        return (b.products?.length ?? 0) - (a.products?.length ?? 0);
      }
      return 0;
    });

    return result;
  }, [initialCircles, selectedDay, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredCircles.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedCircles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCircles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCircles, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDay("ALL");
    setSortBy("booth");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const isCF23Empty = activeEventSlug === "cf23" && initialCircles.length === 0;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200/80 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#F84632]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>KREATOR & BOOTH DIRECTORY</span>
          </div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#111215]">
            DIREKTORI CIRCLE COMIFURO
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-xl">
            Jelajahi circle kreator independen, nomor meja booth resmi, fandom karya, dan simpan wishlist karya favorit.
          </p>
        </div>

        {/* SEARCH BOX (INSTANT CLIENT FILTER) */}
        <div className="w-full sm:w-80 relative">
          <label htmlFor="circle-search" className="sr-only">
            Cari circle atau nomor booth
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            id="circle-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari circle, booth (cth: AA-01), fandom..."
            className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm font-medium text-[#111215] placeholder:text-zinc-400 focus:border-[#111215] focus:outline-none focus:ring-2 focus:ring-[#111215]/10 shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-0.5 rounded-full"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* EVENT SWITCHER TABS */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
          EDISI EVENT:
        </span>
        {events.map((ev) => {
          const isActiveTab = activeEventSlug === ev.slug;
          return (
            <Link
              key={ev.slug}
              href={`/circles?event=${ev.slug}`}
              className={cn(
                "rounded-full px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition border flex items-center gap-2 shadow-xs active:scale-98",
                isActiveTab
                  ? "bg-[#111215] text-[#D6F834] border-[#111215]"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <span>{ev.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-mono",
                  isActiveTab
                    ? "bg-white/20 text-white"
                    : ev.circleCount > 0
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-amber-100 text-amber-800"
                )}
              >
                {ev.circleCount > 0
                  ? `${ev.circleCount.toLocaleString("id-ID")} Circle`
                  : "Upcoming"}
              </span>
            </Link>
          );
        })}
      </div>

      {/* FILTER STRIP & CONTROLS (IF NOT EMPTY CF23) */}
      {!isCF23Empty && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-3 sm:p-4 backdrop-blur-md shadow-xs">
          {/* DAY FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline">
              HARI:
            </span>
            <button
              onClick={() => {
                setSelectedDay("ALL");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-xs font-bold transition",
                selectedDay === "ALL"
                  ? "bg-[#111215] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              Semua Hari
            </button>
            <button
              onClick={() => {
                setSelectedDay("DAY_1");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-xs font-bold transition",
                selectedDay === "DAY_1"
                  ? "bg-[#5398DA] text-[#111215]"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              Day 1 (Sabtu)
            </button>
            <button
              onClick={() => {
                setSelectedDay("DAY_2");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-xs font-bold transition",
                selectedDay === "DAY_2"
                  ? "bg-[#F84632] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              Day 2 (Minggu)
            </button>
          </div>

          {/* SORT CONTROLS & STATS */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
              <label htmlFor="sort-select" className="sr-only">
                Urutkan circle
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "booth" | "name" | "items");
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#111215]"
              >
                <option value="booth">Nomor Meja (A-Z)</option>
                <option value="name">Nama Circle (A-Z)</option>
                <option value="items">Jumlah Karya</option>
              </select>
            </div>

            <span className="font-mono text-xs text-zinc-400 hidden md:inline">·</span>

            <span className="font-mono text-xs font-bold text-zinc-500">
              {totalItems.toLocaleString("id-ID")} Circle
            </span>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      {isCF23Empty ? (
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 sm:p-14 text-center shadow-sm backdrop-blur-md space-y-5 max-w-2xl mx-auto my-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 font-mono text-xs font-bold text-amber-800 uppercase tracking-wider">
            Status Data: Menunggu Rilis Panitia
          </div>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111215]">
            Katalog & Meja Booth CF23 Belum Dirilis
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-zinc-600">
            Daftar circle kreator terkurasi dan pemetaan nomor meja booth untuk Comic Frontier 23 belum dirilis resmi oleh panitia Comifuro.
            Data akan otomatis diperbarui begitu denah resmi dipublikasikan. Anda dapat menjelajahi arsip katalog Comic Frontier 22 untuk melihat karya dan kreator edisi sebelumnya.
          </p>
          <div className="pt-2">
            <Link
              href="/circles?event=cf22"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111215] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-[#D6F834] transition hover:bg-zinc-800 shadow-sm active:scale-95"
            >
              <span>Jelajahi Arsip Comic Frontier 22</span>
            </Link>
          </div>
        </div>
      ) : totalItems === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center space-y-4">
          <p className="font-[var(--font-display)] text-2xl font-bold uppercase text-zinc-800">
            Tidak ada circle yang cocok
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 font-mono">
            {searchQuery
              ? `Tidak ditemukan circle dengan kata kunci "${searchQuery}".`
              : "Tidak ada data circle pada filter yang dipilih."}
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-full bg-[#111215] px-5 py-2.5 font-mono text-xs font-bold text-white transition hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Pencarian & Filter</span>
          </button>
        </div>
      ) : (
        <>
          {/* CIRCLE CARDS GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCircles.map((circle) => (
              <CompactCircleCard
                key={circle.id}
                circle={circle as unknown as CompactCircleItem}
                onSelectCircle={(c) => setSelectedCircle(c)}
              />
            ))}
          </div>

          {/* CLIENT-SIDE PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200/80 pt-6">
              <span className="font-mono text-xs text-zinc-500">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} dari {totalItems.toLocaleString("id-ID")} Circle
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Sebelumnya
                </button>

                <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-zinc-100 text-zinc-800">
                  Halaman {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL POPUP */}
      <CircleCatalogModal
        circle={selectedCircle}
        isOpen={Boolean(selectedCircle)}
        onClose={() => setSelectedCircle(null)}
      />
    </div>
  );
}