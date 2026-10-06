export const revalidate = 120;

import Link from "next/link";
import {
  ArrowUpDown,
  Calendar,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/products/product-card";
import { ProductImage } from "@/components/products/product-image";
import { Pagination } from "@/components/ui/pagination";
import { getBooths, getCircleById, getProducts } from "@/db/queries";
import { buildPathWithQuery, getPageParam, paginateItems, type SearchParams } from "@/lib/admin-ui";
import { formatCurrency } from "@/lib/format";
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
  const typeParam = typeof params.type === "string" ? params.type : undefined;
  const isRush = params.rush === "true" || typeParam === "rush";
  const paidOnly = typeParam === "paid";
  const sort = typeof params.sort === "string" ? params.sort : "latest";
  const circleId = typeof params.circle === "string" ? params.circle : undefined;
  const eventId = typeof params.event === "string" ? params.event : undefined;
  const view = typeof params.view === "string" && params.view === "list" ? "list" : "grid";

  const filterType = isRush ? "rush" : paidOnly ? "paid" : "all";

  const [products, booths, filterCircle] = await Promise.all([
    getProducts({
      q: q || undefined,
      fandom: fandom || undefined,
      circleId: circleId || undefined,
      eventId: eventId || undefined,
      sort,
      targetDay: targetDay || undefined,
      isRush: isRush ? true : undefined,
      paidOnly: paidOnly ? true : undefined
    }),
    getBooths(eventId),
    circleId ? getCircleById(circleId) : Promise.resolve(null)
  ]);

  const boothMap = new Map(booths.map((item) => [`${item.eventId}:${item.circleId}`, item.boothCode]));

  if (sort === "booth") {
    products.sort((a, b) => {
      const codeA = boothMap.get(`${a.eventId}:${a.circleId}`) || "";
      const codeB = boothMap.get(`${b.eventId}:${b.circleId}`) || "";
      if (!codeA && !codeB) return 0;
      if (!codeA) return 1;
      if (!codeB) return -1;
      return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: "base" });
    });
  }

  const pageParam = getPageParam(params as SearchParams);
  const pagination = paginateItems(products, pageParam, 24);

  function getFilterHref(updates: Record<string, string | undefined>) {
    const nextQuery: Record<string, string | undefined> = {
      q,
      day: targetDay,
      type: filterType === "all" ? undefined : filterType,
      fandom,
      sort: sort === "latest" ? undefined : sort,
      event: eventId,
      circle: circleId,
      view: view === "grid" ? undefined : view,
      ...updates
    };

    const cleaned: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(nextQuery)) {
      if (v && v !== "all") {
        cleaned[k] = v;
      }
    }

    return buildPathWithQuery("/products", cleaned);
  }

  const hasActiveFilters = Boolean(
    q ||
    (targetDay && targetDay !== "ALL_DAYS") ||
    filterType !== "all" ||
    fandom ||
    circleId ||
    (sort && sort !== "latest")
  );

  return (
    <div className="container-shell space-y-8 py-8 sm:py-10">
      {/* =================================================================== */}
      {/* EDITORIAL HEADER (TANALOKA STYLE)                                   */}
      {/* =================================================================== */}
      <div className="space-y-3 border-b border-black/10 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F84632]/25 bg-[#F84632]/10 px-3 py-1 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#F84632]" />
          <span className="font-mono text-xs font-bold tracking-widest text-[#F84632] uppercase">
            DIRECTORY & CATALOG
          </span>
        </div>

        <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#111215] leading-[0.92]">
          KATALOG KARYA & MERCHANDISE COMIFURO<span className="text-[#F84632]">*</span>
        </h1>

        <p className="max-w-3xl text-sm sm:text-base font-medium leading-relaxed text-[#111215]/80">
          Jelajahi ribuan karya independen, merchandise eksklusif, artbook, dan incaran rush pagi dari kreator Comifuro.
          Gunakan pencarian cerdas untuk melacak karya berdasarkan nama produk, circle, kode booth (misal AA-01), atau fandom favoritmu.
        </p>
      </div>

      {/* =================================================================== */}
      {/* KONTROL PENGUNJUNG: SEARCH & FILTER CHIPS (TANALOKA STYLE)          */}
      {/* =================================================================== */}
      <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur-md sm:p-6">
        {/* Search Bar Terpadu */}
        <form action="/products" method="GET" className="relative w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama karya, circle, kode booth (misal AA-01), atau fandom..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 py-3.5 pl-11 pr-24 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-inner focus:border-[#F84632] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84632]/20 transition"
            />
            {q ? (
              <Link
                href={getFilterHref({ q: undefined })}
                className="absolute right-20 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 transition"
                title="Hapus kata kunci pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            <button
              type="submit"
              className="absolute right-2 rounded-xl bg-[#111215] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D6F834] transition hover:bg-zinc-800"
            >
              Cari
            </button>
          </div>

          {/* Hidden inputs to preserve filters when submitting search */}
          {targetDay && targetDay !== "ALL_DAYS" ? <input type="hidden" name="day" value={targetDay} /> : null}
          {filterType !== "all" ? <input type="hidden" name="type" value={filterType} /> : null}
          {fandom ? <input type="hidden" name="fandom" value={fandom} /> : null}
          {sort && sort !== "latest" ? <input type="hidden" name="sort" value={sort} /> : null}
          {circleId ? <input type="hidden" name="circle" value={circleId} /> : null}
          {eventId ? <input type="hidden" name="event" value={eventId} /> : null}
          {view !== "grid" ? <input type="hidden" name="view" value={view} /> : null}
        </form>

        {/* Filter Chips: Hari & Tipe (Category) */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-100 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter Hari */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Hari:
            </span>
            <Link
              href={getFilterHref({ day: undefined })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                !targetDay || targetDay === "ALL_DAYS"
                  ? "bg-[#111215] text-white border-[#111215] shadow-xs"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              Semua Hari
            </Link>
            <Link
              href={getFilterHref({ day: "DAY_1" })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                targetDay === "DAY_1"
                  ? "bg-[#5398DA] text-white border-[#5398DA] shadow-xs shadow-[#5398DA]/25"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-[#5398DA]/50 hover:text-[#5398DA]"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", targetDay === "DAY_1" ? "bg-white" : "bg-[#5398DA]")} />
              Day 1 (Sabtu)
            </Link>
            <Link
              href={getFilterHref({ day: "DAY_2" })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                targetDay === "DAY_2"
                  ? "bg-[#D6F834] text-[#111215] border-[#D6F834] font-bold shadow-xs shadow-[#D6F834]/30"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-[#D6F834] hover:bg-[#D6F834]/10"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", targetDay === "DAY_2" ? "bg-[#111215]" : "bg-[#a3c30a]")} />
              Day 2 (Minggu)
            </Link>
          </div>

          {/* Filter Tipe / Kategori */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Tipe:
            </span>
            <Link
              href={getFilterHref({ type: undefined })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                filterType === "all"
                  ? "bg-[#111215] text-white border-[#111215] shadow-xs"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              Semua Kategori
            </Link>
            <Link
              href={getFilterHref({ type: "rush" })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                filterType === "rush"
                  ? "bg-[#F84632] text-white border-[#F84632] font-bold shadow-xs shadow-[#F84632]/25"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-[#F84632]/50 hover:text-[#F84632] hover:bg-[#F84632]/5"
              )}
            >
              <span>⚡ Incaran Rush Pagi</span>
            </Link>
            <Link
              href={getFilterHref({ type: "paid" })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                filterType === "paid"
                  ? "bg-[#111215] text-[#D6F834] border-[#111215] font-bold shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              Karya Berbayar
            </Link>
          </div>
        </div>

        {/* Tag Fandom Cepat */}
        <div className="pt-3 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
              Fandom Cepat:
            </span>
            {POPULAR_FANDOMS.map((f) => {
              const isActive = fandom?.toLowerCase() === f.toLowerCase();
              return (
                <Link
                  key={f}
                  href={getFilterHref({ fandom: isActive ? undefined : f })}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition border",
                    isActive
                      ? "bg-[#F84632] text-white border-[#F84632] font-semibold shadow-xs"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-[#F84632] hover:text-[#F84632] hover:bg-[#F84632]/5"
                  )}
                >
                  <span>{f}</span>
                  {isActive ? <X className="h-3 w-3 ml-0.5" /> : null}
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
          <span className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-800 shadow-2xs">
            <strong className="text-[#F84632] font-mono text-sm">{products.length.toLocaleString("id-ID")}</strong> item ditemukan
          </span>

          {filterCircle ? (
            <Link
              href={getFilterHref({ circle: undefined })}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 transition"
              title="Hapus filter circle"
            >
              <span>Circle: {filterCircle.name}</span>
              <X className="h-3 w-3 text-zinc-500" />
            </Link>
          ) : null}

          {fandom ? (
            <Link
              href={getFilterHref({ fandom: undefined })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F84632]/10 border border-[#F84632]/25 px-3 py-1 text-xs font-semibold text-[#F84632] hover:bg-[#F84632]/20 transition"
              title="Hapus filter fandom"
            >
              <span>Fandom: {fandom}</span>
              <X className="h-3 w-3" />
            </Link>
          ) : null}

          {hasActiveFilters ? (
            <Link
              href="/products"
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-[#F84632] hover:bg-zinc-50 hover:underline transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Semua Filter
            </Link>
          ) : null}
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sort Control */}
          <div className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xs">
            <span className="px-2 text-[11px] font-mono font-bold uppercase text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              Sort:
            </span>
            <Link
              href={getFilterHref({ sort: undefined })}
              className={cn(
                "rounded-xl px-2.5 py-1 text-xs font-semibold transition",
                !sort || sort === "latest"
                  ? "bg-[#111215] text-[#D6F834]"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Terbaru
            </Link>
            <Link
              href={getFilterHref({ sort: "price" })}
              className={cn(
                "rounded-xl px-2.5 py-1 text-xs font-semibold transition",
                sort === "price"
                  ? "bg-[#111215] text-[#D6F834]"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Harga
            </Link>
            <Link
              href={getFilterHref({ sort: "booth" })}
              className={cn(
                "rounded-xl px-2.5 py-1 text-xs font-semibold transition",
                sort === "booth"
                  ? "bg-[#111215] text-[#D6F834]"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Nomor Booth
            </Link>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xs">
            <Link
              href={getFilterHref({ view: undefined })}
              className={cn(
                "rounded-xl p-1.5 transition",
                view === "grid" ? "bg-zinc-100 text-[#111215]" : "text-zinc-400 hover:text-zinc-700"
              )}
              title="Tampilan Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
            <Link
              href={getFilterHref({ view: "list" })}
              className={cn(
                "rounded-xl p-1.5 transition",
                view === "list" ? "bg-zinc-100 text-[#111215]" : "text-zinc-400 hover:text-zinc-700"
              )}
              title="Tampilan List"
            >
              <List className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* DAFTAR PRODUK (GRID / LIST VIEW)                                    */}
      {/* =================================================================== */}
      {pagination.totalItems ? (
        <>
          {view === "list" ? (
            <div className="space-y-3">
              {pagination.items.map((product) => {
                const booth = boothMap.get(`${product.eventId}:${product.circleId}`);
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="panel group flex flex-col gap-3 p-4 transition hover:border-[#F84632]/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {product.imageUrl ? (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full rounded-none border-0 aspect-square"
                            fallbackLabel="No image"
                            showLoading={false}
                          />
                        </div>
                      ) : null}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {product.isRush ? (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              RUSH
                            </span>
                          ) : null}
                          {product.targetDay ? (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                              {product.targetDay === "DAY_1" ? "Day 1" : product.targetDay === "DAY_2" ? "Day 2" : "All Days"}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 font-[var(--font-display)] text-xl font-semibold text-zinc-900 group-hover:text-[#F84632] transition">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700">{product.circle.name}</span>
                          {booth ? (
                            <span className="ml-2 font-mono font-bold text-zinc-900">
                              · Booth {booth}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-base font-bold text-zinc-900">
                        {product.price > 0 ? formatCurrency(product.price) : "Sampel Karya"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {product.purchaseType === "PO" ? "📦 Pre-Order" : "💵 On The Spot"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pagination.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  boothCode={boothMap.get(`${product.eventId}:${product.circleId}`) || null}
                />
              ))}
            </div>
          )}

          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            pathname="/products"
            query={{
              q,
              day: targetDay && targetDay !== "ALL_DAYS" ? targetDay : undefined,
              type: filterType !== "all" ? filterType : undefined,
              fandom,
              circle: circleId,
              event: eventId,
              sort: sort !== "latest" ? sort : undefined,
              view: view !== "grid" ? view : undefined
            }}
          />
        </>
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="Karya atau merchandise tidak ditemukan"
            description="Tidak ada item yang cocok dengan kata kunci atau kombinasi filter saat ini. Coba ubah pencarian atau reset filter."
          />
          {hasActiveFilters ? (
            <div className="flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#111215] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D6F834] transition hover:bg-zinc-800 shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Semua Filter
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
