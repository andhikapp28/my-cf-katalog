export const revalidate = 120;

import Link from "next/link";
import { RotateCcw, Search, X } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { CircleCatalogClient } from "@/components/products/circle-catalog-client";
import { getCatalogCircles } from "@/db/queries";
import { buildPathWithQuery, getPageParam, paginateItems, type SearchParams } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

const POPULAR_FANDOMS = [
  "Original",
  "Genshin Impact",
  "Honkai Star Rail",
  "Hololive",
  "Blue Archive",
  "Love and Deepspace",
  "Pokemon",
  "Nijisanji",
  "Zenless Zone Zero",
  "Arknights",
  "Fate"
] as const;

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const fandom = typeof params.fandom === "string" ? params.fandom.trim() : undefined;
  const targetDay = typeof params.day === "string" ? params.day : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "booth";
  const circleId = typeof params.circle === "string" ? params.circle : undefined;
  const eventId = typeof params.event === "string" ? params.event : undefined;

  const circles = await getCatalogCircles({
    q: q || undefined,
    fandom: fandom || undefined,
    day: targetDay || undefined,
    circleId: circleId || undefined,
    eventId: eventId || undefined,
    sort
  });

  const pageParam = getPageParam(params as SearchParams);
  const pagination = paginateItems(circles, pageParam, 24);

  function getFilterHref(updates: Record<string, string | undefined>) {
    const nextQuery: Record<string, string | undefined> = {
      q,
      day: targetDay,
      fandom,
      sort: sort === "booth" ? undefined : sort,
      event: eventId,
      circle: circleId,
      ...updates
    };

    const cleaned: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(nextQuery)) {
      if (v && v !== "all" && v !== "ALL_DAYS") {
        cleaned[k] = v;
      }
    }

    return buildPathWithQuery("/products", cleaned);
  }

  const hasActiveFilters = Boolean(
    q ||
    (targetDay && targetDay !== "ALL_DAYS") ||
    fandom ||
    circleId ||
    (sort && sort !== "booth")
  );

  return (
    <div className="container-shell space-y-8 py-8 sm:py-10">
      {/* =================================================================== */}
      {/* EDITORIAL HEADER (TANALOKA STYLE)                                   */}
      {/* =================================================================== */}
      <div className="space-y-3 border-b border-black/10 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F84632]/25 bg-[#F84632]/10 px-3 py-1 shadow-xs">
          <span className="font-mono text-xs font-bold tracking-widest text-[#F84632] uppercase">
            DIRECTORY & CATALOG
          </span>
        </div>

        <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#111215] leading-[0.92]">
          DIREKTORI CIRCLE & KATALOG KARYA COMIFURO<span className="text-[#F84632]">*</span>
        </h1>

        <p className="max-w-3xl text-sm sm:text-base font-medium leading-relaxed text-[#111215]/80">
          Jelajahi direktori circle kreator independen, artbook, doujinshi, dan merchandise Comifuro.
          Gunakan pencarian cerdas untuk melacak circle berdasarkan nama, nomor booth (misal AA-01), atau fandom favoritmu untuk menyusun rute buruanmu.
        </p>
      </div>

      {/* =================================================================== */}
      {/* KONTROL PENGUNJUNG: SEARCH & FILTER CHIPS (TEXT-ONLY, TANPA IKON)   */}
      {/* =================================================================== */}
      <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur-md sm:p-6">
        {/* Search Bar Terpadu */}
        <form action="/products" method="GET" className="relative w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama circle, nomor booth (AA-01), atau fandom..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 py-3.5 pl-4 pr-36 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-inner focus:border-[#F84632] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84632]/20 transition"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {q ? (
                <Link
                  href={getFilterHref({ q: undefined })}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition shadow-2xs"
                  title="Hapus kata kunci pencarian"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </Link>
              ) : null}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#111215] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D6F834] transition hover:bg-zinc-800 shadow-xs active:scale-95"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Cari</span>
              </button>
            </div>
          </div>

          {/* Hidden inputs to preserve filters when submitting search */}
          {targetDay && targetDay !== "ALL_DAYS" ? <input type="hidden" name="day" value={targetDay} /> : null}
          {fandom ? <input type="hidden" name="fandom" value={fandom} /> : null}
          {sort && sort !== "booth" ? <input type="hidden" name="sort" value={sort} /> : null}
          {circleId ? <input type="hidden" name="circle" value={circleId} /> : null}
          {eventId ? <input type="hidden" name="event" value={eventId} /> : null}
        </form>

        {/* Filter Hari (Text-Only Pills) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1">
            HARI:
          </span>
          <Link
            href={getFilterHref({ day: undefined })}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border",
              !targetDay || targetDay === "ALL_DAYS"
                ? "bg-[#111215] text-[#D6F834] border-[#111215] shadow-xs"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            SEMUA HARI
          </Link>
          <Link
            href={getFilterHref({ day: "DAY_1" })}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border",
              targetDay === "DAY_1"
                ? "bg-[#5398DA] text-white border-[#5398DA] shadow-xs shadow-[#5398DA]/25"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-[#5398DA]/50 hover:text-[#5398DA]"
            )}
          >
            DAY 1 (SABTU)
          </Link>
          <Link
            href={getFilterHref({ day: "DAY_2" })}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border",
              targetDay === "DAY_2"
                ? "bg-[#D6F834] text-[#111215] border-[#D6F834] shadow-xs shadow-[#D6F834]/30"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-[#D6F834] hover:bg-[#D6F834]/10"
            )}
          >
            DAY 2 (MINGGU)
          </Link>
        </div>

        {/* Fandom Pills Populer (Text-Only) */}
        <div className="pt-3 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
              FANDOM POPULER:
            </span>
            {POPULAR_FANDOMS.map((f) => {
              const isActive = fandom?.toLowerCase() === f.toLowerCase();
              return (
                <Link
                  key={f}
                  href={getFilterHref({ fandom: isActive ? undefined : f })}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition border",
                    isActive
                      ? "bg-[#F84632] text-white border-[#F84632] shadow-xs"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-[#F84632] hover:text-[#F84632] hover:bg-[#F84632]/5"
                  )}
                >
                  {f} {isActive ? "[ X ]" : ""}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TOOLBAR: METRIC COUNT, ACTIVE FILTERS & SORT CONTROLS               */}
      {/* =================================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Count & Active Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-zinc-800 shadow-2xs">
            <strong className="text-[#F84632] font-mono text-sm">{circles.length.toLocaleString("id-ID")}</strong> CIRCLE DITEMUKAN
          </span>

          {fandom ? (
            <Link
              href={getFilterHref({ fandom: undefined })}
              className="inline-flex items-center gap-1 rounded-full bg-[#F84632]/10 border border-[#F84632]/25 px-3 py-1 font-mono text-xs font-bold text-[#F84632] hover:bg-[#F84632]/20 transition"
              title="Hapus filter fandom"
            >
              <span>FANDOM: {fandom.toUpperCase()} [ X ]</span>
            </Link>
          ) : null}

          {hasActiveFilters ? (
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-[#F84632] hover:bg-zinc-50 transition shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </Link>
          ) : null}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xs">
            <span className="px-2 text-[11px] font-mono font-bold uppercase text-zinc-400">
              SORT:
            </span>
            <Link
              href={getFilterHref({ sort: undefined })}
              className={cn(
                "rounded-xl px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition",
                !sort || sort === "booth"
                  ? "bg-[#111215] text-[#D6F834]"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Booth
            </Link>
            <Link
              href={getFilterHref({ sort: "name" })}
              className={cn(
                "rounded-xl px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition",
                sort === "name"
                  ? "bg-[#111215] text-[#D6F834]"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Nama
            </Link>
            <Link
              href={getFilterHref({ sort: "latest" })}
              className={cn(
                "rounded-xl px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition",
                sort === "latest"
                  ? "bg-[#111215] text-[#D6F834]"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Terbaru
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* DAFTAR CIRCLE (COMPACT CIRCLE CARDS + MODAL)                        */}
      {/* =================================================================== */}
      {pagination.totalItems ? (
        <>
          <CircleCatalogClient
            circles={pagination.items}
            initialCircleId={circleId}
          />

          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            pathname="/products"
            query={{
              q,
              day: targetDay && targetDay !== "ALL_DAYS" ? targetDay : undefined,
              fandom,
              circle: circleId,
              event: eventId,
              sort: sort !== "booth" ? sort : undefined
            }}
          />
        </>
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="Circle tidak ditemukan"
            description="Tidak ada circle yang cocok dengan kata kunci atau kombinasi filter saat ini. Coba ubah pencarian atau reset filter."
          />
          {hasActiveFilters ? (
            <div className="flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center rounded-xl bg-[#111215] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#D6F834] transition hover:bg-zinc-800 shadow-sm"
              >
                [ RESET SEMUA FILTER ]
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
