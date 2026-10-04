export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  BookOpen,
  Layers,
  MapPin,
  Sparkles,
  Users2,
  WifiOff,
  Zap
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PreloadOfflineButton } from "@/components/dashboard/preload-offline-button";
import { getLandingPageData } from "@/db/queries";
import { formatDate } from "@/lib/format";
import { eventDayShortLabels, type EventDay } from "@/lib/constants";

export default async function HomePage() {
  const data = await getLandingPageData();

  if (!data) {
    return (
      <div className="container-shell py-12">
        <EmptyState
          title="Belum ada event aktif"
          description="Tambahkan event Comifuro terlebih dahulu di admin panel atau jalankan script import data."
        />
      </div>
    );
  }

  const { event, stats, featuredCircles, featuredProducts } = data;

  return (
    <div className="flex flex-col">
      {/* ========================================================================= */}
      {/* SECTION 1: COVER HERO (Contemporary Editorial Style - Image 2 Inspired)   */}
      {/* Bold Electric Sky Blue Canvas + Acid Lime Typography + Layered Depths     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#1E56C8] px-4 pt-10 pb-16 text-white sm:px-6 md:pt-14 md:pb-24 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="container-shell relative z-10 max-w-7xl mx-auto space-y-8">
          {/* Top Editorial Label Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4 text-xs font-mono tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#E2F13C] animate-pulse" />
              <span className="font-bold text-[#E2F13C]">COMIPOCKET GUIDE</span>
              <span className="text-white/40">/</span>
              <span>COMIC FRONTIER 22</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <span>ICE BSD CITY</span>
              <span>HALL 8 & 9</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-[#E2F13C]">OFFLINE PWA</span>
            </div>
          </div>

          {/* Massive Editorial Headline & Slogan Grid */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-mono font-bold tracking-[0.25em] text-[#E2F13C] uppercase">
                WHERE EVERY CREATOR GATHERS
              </p>
              <h1 className="font-[var(--font-display)] text-5xl font-black tracking-tighter uppercase sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] text-white">
                HUNTING <br />
                <span className="text-[#E2F13C]">COMIFURO</span> <br />
                TANPA MATI SINYAL<span className="text-[#FF4D30]">*</span>
              </h1>
            </div>

            <div className="lg:col-span-4 space-y-6 lg:pb-2">
              <p className="text-sm font-medium leading-relaxed text-white/85 sm:text-base">
                Katalog digital personal untuk menjelajahi 1.400+ circle kreator, rute lorong booth, kalkulator cash ATM, dan checklist belanja yang tetap aktif 100% di dalam hall ICE BSD.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-[#E2F13C] px-6 py-3.5 text-sm font-bold text-ink-950 transition hover:bg-[#d6e530] active:scale-[0.98] shadow-lg"
                >
                  Jelajahi 1.400+ Circle
                </Link>
                <Link
                  href="/maps"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
                >
                  Peta Hall 8 & 9
                </Link>
                <PreloadOfflineButton
                  productIds={featuredProducts.map((p) => p.id)}
                  circleIds={featuredCircles.map((c) => c.id)}
                />
              </div>
            </div>
          </div>

          {/* Layered Display Strip */}
          <div className="pt-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase">{event.name}</span>
                <span>·</span>
                <span>{event.venue || "ICE BSD City"}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{formatDate(event.startsAt)}</span>
                <span className="rounded-full bg-[#FF4D30] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  DAY 1 & 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: DATA PULSE INFOGRAPH (Deep Dark Style - Image 1 AISUM Inspired)*/}
      {/* Pitch Charcoal Black + 4 Massive Metric Cards + Crisp Coral Asterisk     */}
      {/* ========================================================================= */}
      <section className="bg-[#0B0B0E] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
        <div className="container-shell max-w-7xl mx-auto space-y-12">
          {/* 2-Column Editorial Section Header */}
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-white/10 pb-8">
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#FF6B4A] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>EVENT PULSE & METRICS</span>
              </div>
              <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">
                CONVENTION MEETS PREPARATION<span className="text-[#FF6B4A]">*</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                Seluruh data diekstrak langsung dari direktori resmi Comic Frontier 22. Diindeks ke dalam arsitektur offline-first untuk keandalan maksimal di lapangan.
              </p>
            </div>
          </div>

          {/* 4-Metric Grid (Exact AISUM Style) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {/* Metric 1 */}
            <div className="group rounded-2xl border border-white/10 bg-[#141418] p-6 transition hover:border-[#FF6B4A]/50 hover:bg-[#18181F]">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                {stats.totalCircles.toLocaleString("id-ID")}
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/80">
                  CIRCLES
                </span>
                <Users2 className="h-4 w-4 text-[#FF6B4A]" />
              </div>
              <p className="mt-1 text-[11px] text-white/40">Artist Alley & Creator Alley</p>
            </div>

            {/* Metric 2 */}
            <div className="group rounded-2xl border border-white/10 bg-[#141418] p-6 transition hover:border-[#FF6B4A]/50 hover:bg-[#18181F]">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                {stats.totalProducts.toLocaleString("id-ID")}
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/80">
                  SAMPEL KARYA
                </span>
                <BookOpen className="h-4 w-4 text-[#FF6B4A]" />
              </div>
              <p className="mt-1 text-[11px] text-white/40">Artbook, Standee, Novel & Merch</p>
            </div>

            {/* Metric 3 */}
            <div className="group rounded-2xl border border-white/10 bg-[#141418] p-6 transition hover:border-[#FF6B4A]/50 hover:bg-[#18181F]">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                0{stats.totalHalls}
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/80">
                  HALL VENUE
                </span>
                <Layers className="h-4 w-4 text-[#FF6B4A]" />
              </div>
              <p className="mt-1 text-[11px] text-white/40">Hall 8 (Art) & Hall 9 (Corp/Creator)</p>
            </div>

            {/* Metric 4 */}
            <div className="group rounded-2xl border border-white/10 bg-[#141418] p-6 transition hover:border-[#FF6B4A]/50 hover:bg-[#18181F]">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                100%
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/80">
                  OFFLINE READY
                </span>
                <WifiOff className="h-4 w-4 text-[#FF6B4A]" />
              </div>
              <p className="mt-1 text-[11px] text-white/40">Service Worker & Local Cache</p>
            </div>
          </div>

          {/* Tactical Field Guides Bar (ICE BSD Essentials) */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#141418] p-4 flex items-start gap-3">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">⚡ Rush Tracker 10:00</h4>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  Tandai barang incaran limited agar muncul di antrean teratas ronde pertama sebelum kehabisan.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141418] p-4 flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 shrink-0">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">💵 ATM Cash Buffer</h4>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  Hitung kebutuhan uang tunai otomatis. Sinyal ICE BSD rawan down dan antrean ATM sering ludes.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141418] p-4 flex items-start gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">🗺️ Aisle Next Booth</h4>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  Navigasi denah hall terpadu dengan algoritma rute berurutan antar lorong A sampai Z.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: COMIFURO DIRECTORY & CURATED GRID (Image 2 Calendar Inspired)  */}
      {/* 4-Column Curated Cards with Circle Cuts, Booth Badges & Day Tags          */}
      {/* ========================================================================= */}
      <section className="bg-[#FAF9F6] px-4 py-16 text-ink-950 sm:px-6 md:py-24 lg:px-8">
        <div className="container-shell max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-ink-950/10 pb-6">
            <div>
              <p className="text-xs font-mono font-bold tracking-widest text-[#E6392F] uppercase">
                DIRECTORY & ARTIST SHOWCASE
              </p>
              <h2 className="mt-1 font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase text-ink-950">
                COMIFURO 22 CIRCLES
              </h2>
              <p className="mt-2 text-sm text-ink-600 max-w-xl">
                Jelajahi karya kreator lokal dan mancanegara. Disortir berdasarkan nomor meja resmi Comic Frontier 22.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/circles"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-950/20 bg-white px-5 py-2.5 text-xs font-bold font-mono text-ink-900 transition hover:bg-ink-50 shadow-xs"
              >
                <span>LIHAT SEMUA CIRCLE</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4-Column Gallery Grid (TARILOKA Style) */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCircles.map((circle) => {
              const booth = circle.boothLocations[0];
              const product = circle.products[0];
              const sampleImage = product?.imageUrl || null;

              return (
                <article
                  key={circle.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-950/10 bg-white p-4 transition-all hover:border-ink-950/30 hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Visual Cutout / Sample Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100 border border-ink-950/5">
                      {sampleImage ? (
                        <Image
                          src={sampleImage}
                          alt={circle.name}
                          fill
                          unoptimized
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono text-xs font-semibold text-ink-400 bg-stone-100">
                          {circle.name.slice(0, 3).toUpperCase()}
                        </div>
                      )}

                      {/* Booth Tag Plate */}
                      <div className="absolute top-2.5 left-2.5 rounded-md bg-ink-950 px-2.5 py-1 text-xs font-mono font-black text-white shadow-sm">
                        {booth?.boothCode || "BOOTH"}
                      </div>

                      {booth?.day ? (
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="rounded bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-mono font-bold text-ink-800 shadow-xs">
                            {eventDayShortLabels[booth.day as EventDay]}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="font-[var(--font-display)] text-lg font-bold text-ink-900 group-hover:text-[#1E56C8] transition-colors line-clamp-1">
                        {circle.name}
                      </h3>
                      {circle.notes ? (
                        <p className="mt-1 text-xs text-ink-500 line-clamp-2 leading-relaxed">
                          {circle.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Bottom Links */}
                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-950/10 pt-3 text-xs font-mono">
                    <Link
                      href={`/circles/${circle.id}`}
                      className="font-bold text-[#1E56C8] hover:underline"
                    >
                      Profil Circle
                    </Link>
                    {booth?.floorMapId ? (
                      <Link
                        href={`/maps/${booth.floorMapId}?circleId=${circle.id}`}
                        className="text-ink-500 hover:text-ink-900"
                      >
                        Peta
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Quick Fandom & Category Tags */}
          <div className="rounded-2xl border border-ink-950/10 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-500">
                PENCARIAN CEPAT FANDOM COMIFURO 22:
              </span>
              <Link href="/products" className="text-xs font-mono font-bold text-[#1E56C8] hover:underline">
                Buka Filter Lengkap
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono font-semibold">
              {[
                "Original",
                "Genshin Impact",
                "Honkai Star Rail",
                "Hoyoverse",
                "Hololive",
                "Blue Archive",
                "Love and Deepspace",
                "Pokemon",
                "Haikyuu",
                "Uma Musume"
              ].map((fandom) => (
                <Link
                  key={fandom}
                  href={`/products?q=${encodeURIComponent(fandom)}`}
                  className="rounded-lg border border-ink-950/10 bg-ink-50/50 px-3 py-1.5 text-ink-800 transition hover:border-ink-950 hover:bg-ink-950 hover:text-white"
                >
                  {fandom}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
