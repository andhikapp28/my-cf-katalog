export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  Users2,
  WifiOff
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PreloadOfflineButton } from "@/components/dashboard/preload-offline-button";
import {
  FadeInView,
  HeroEntranceMotion,
  HeroEntranceItem,
  MetricCardMotion,
  BannerCardMotion,
  BannerBadgeMotion
} from "@/components/landing/landing-motion";
import { getLandingPageData } from "@/db/queries";
import { cn } from "@/lib/utils";

interface ComifuroEdition {
  id: string;
  editionBadge: string;
  title: string;
  status: "Coming Soon" | "Past Event";
  date: string;
  venue: string;
  bannerImage: string;
  linkHref: string;
  linkText: string;
  description: string;
}

const comifuroEditions: ComifuroEdition[] = [
  {
    id: "cf23",
    editionBadge: "CF 23",
    title: "Comic Frontier 23",
    status: "Coming Soon",
    date: "Q4 2026",
    venue: "ICE BSD City, Tangerang",
    bannerImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    linkHref: "/events",
    linkText: "Detail Event",
    description: "Perhelatan akbar Comic Frontier mendatang. Siapkan wishlist dan tabungan untuk karya kreator terbaru."
  },
  {
    id: "cf22",
    editionBadge: "CF 22",
    title: "Comic Frontier 22",
    status: "Past Event",
    date: "11 - 12 Mei 2024",
    venue: "ICE BSD City (Hall 8 & 9)",
    bannerImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    linkHref: "/products",
    linkText: "Jelajahi Katalog",
    description: "1.400+ Circle kreator independen, artist alley, panggung kreator, dan ribuan rilisan eksklusif."
  },
  {
    id: "cf21",
    editionBadge: "CF 21",
    title: "Comic Frontier 21",
    status: "Past Event",
    date: "16 - 17 Desember 2023",
    venue: "ICE BSD City (Hall 7, 8 & 9)",
    bannerImage:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    linkHref: "/events",
    linkText: "Lihat Arsip",
    description: "Perayaan akhir tahun komunitas komik dan pop-kultur terbesar di Indonesia dengan area multi-hall."
  },
  {
    id: "cf20",
    editionBadge: "CF 20",
    title: "Comic Frontier 20",
    status: "Past Event",
    date: "11 - 12 Maret 2023",
    venue: "ICE BSD City (Hall 8 & 9)",
    bannerImage:
      "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=1200&q=80",
    linkHref: "/events",
    linkText: "Lihat Arsip",
    description: "Dua dekade gelaran Comic Frontier menyatukan karya doujinshi, kreator lokal, dan merchandise eksklusif."
  },
  {
    id: "cf19",
    editionBadge: "CF 19",
    title: "Comic Frontier 19",
    status: "Past Event",
    date: "24 - 25 September 2022",
    venue: "ICE BSD City (Hall 10)",
    bannerImage:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    linkHref: "/events",
    linkText: "Lihat Arsip",
    description: "Kembalinya pameran tatap muka Comic Frontier pasca pandemi di hall megah ICE BSD City."
  },
  {
    id: "cf18",
    editionBadge: "CF 18",
    title: "Comic Frontier 18",
    status: "Past Event",
    date: "17 - 18 Juli 2021",
    venue: "Online Virtual Edition",
    bannerImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    linkHref: "/events",
    linkText: "Lihat Arsip",
    description: "Edisi perhelatan virtual spesial yang menghubungkan lingkaran kreator dan penikmat seni di ruang digital."
  }
];

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

  const { stats, featuredCircles, featuredProducts } = data;

  return (
    <div className="relative min-h-screen selection:bg-[#D6F834] selection:text-[#111215]">
      {/* ========================================================================= */}
      {/* SECTION 1: COVER HERO (TANALOKA EDITORIAL STYLE WITH MASKING TYPOGRAPHY)  */}
      {/* Sky Blue Canvas (#5398DA) + Giant Acid Lime Text Behind Cutout Mascot    */}
      {/* ========================================================================= */}
      <section className="relative z-10 overflow-hidden bg-[#5398DA] text-white pt-8 pb-20 sm:pb-28 lg:pb-36">
        {/* Subtle technical background grid */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
          <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-[#D6F834]/15 blur-[100px]" />
        </div>

        <div className="container-shell max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Editorial Slogans Flanking the Canvas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <HeroEntranceMotion className="space-y-1">
              <HeroEntranceItem>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-white uppercase backdrop-blur-md shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D6F834] animate-pulse" />
                  <span>COMIFURO COMPANION GUIDE</span>
                  <span className="text-[#F84632] font-black">*</span>
                </div>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="font-mono text-xs sm:text-sm font-bold tracking-[0.22em] text-[#D6F834] uppercase">
                  WHERE EVERY CREATOR GATHERS
                </p>
                <p className="text-xs sm:text-sm font-medium text-white/90 max-w-xs leading-relaxed">
                  Kurasi resmi untuk para penjelajah, seniman independen, dan pemburu karya Comic Frontier.
                </p>
              </HeroEntranceItem>
            </HeroEntranceMotion>

            <HeroEntranceMotion className="space-y-1 sm:text-right">
              <HeroEntranceItem>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-mono font-medium text-white/90 backdrop-blur-md sm:ml-auto">
                  <span>ICE BSD CITY</span>
                  <span>·</span>
                  <span>HALL 8 & 9</span>
                </div>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="font-mono text-xs sm:text-sm font-bold tracking-[0.22em] text-white uppercase">
                  HUNTING COMIFURO<span className="text-[#F84632]">*</span> TANPA MATI SINYAL
                </p>
                <p className="text-xs sm:text-sm font-medium text-white/85 max-w-xs sm:ml-auto leading-relaxed">
                  1.400+ circle kreator, denah booth ICE BSD, kalkulator cash ATM, dan checklist belanja offline.
                </p>
              </HeroEntranceItem>
            </HeroEntranceMotion>
          </div>

          {/* ===================================================================== */}
          {/* THE MASKING COMPOSITION: GIANT COMIPOCKET LETTERS + OVERLAPPING MASCOT */}
          {/* Layer 0: Giant Acid Lime '#D6F834' Text                               */}
          {/* Layer 1: Cutout Mascot in Front (Physically Overlaps & Masks Text)     */}
          {/* ===================================================================== */}
          <div className="relative w-full min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[640px] flex items-center justify-center pt-2 sm:pt-4">
            {/* Layer 0: Giant Typography Spanning Across the Screen Behind Mascot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <span className="font-[var(--font-display)] font-black text-[16vw] sm:text-[17vw] lg:text-[18vw] tracking-tighter text-[#D6F834] uppercase leading-none select-none drop-shadow-sm whitespace-nowrap opacity-95">
                COMIPOCKET
              </span>
            </div>

            {/* Layer 1: Mascot Cutout Standing in the Foreground Overlapping the Letters */}
            <div className="relative z-10 mx-auto flex items-end justify-center pointer-events-none">
              <Image
                src="/mascot.png"
                alt="ComiPocket Mascot"
                width={550}
                height={850}
                priority
                unoptimized
                className="h-[360px] sm:h-[460px] md:h-[540px] lg:h-[620px] w-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)] select-none"
              />
            </div>
          </div>

          {/* Layer 2: Floating High-Contrast CTA Buttons */}
          <HeroEntranceMotion className="relative z-20 flex flex-wrap items-center justify-center gap-3 pt-2 sm:pt-4">
            <HeroEntranceItem>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[#D6F834] px-8 py-3.5 text-sm font-extrabold text-[#111215] shadow-xl hover:bg-[#cbf128] transition active:scale-[0.98] uppercase tracking-wide"
              >
                JELAJAHI 1.400+ CIRCLE
              </Link>
            </HeroEntranceItem>

            <HeroEntranceItem>
              <Link
                href="/maps"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/25 active:scale-[0.98]"
              >
                Peta Denah Hall
              </Link>
            </HeroEntranceItem>

            <HeroEntranceItem>
              <PreloadOfflineButton
                productIds={featuredProducts.map((p) => p.id)}
                circleIds={featuredCircles.map((c) => c.id)}
              />
            </HeroEntranceItem>
          </HeroEntranceMotion>
        </div>

        {/* Seamless Soft Transition into Dark Section 2 */}
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-b from-transparent via-[#2b598d]/60 to-[#111215] pointer-events-none" />
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: DATA PULSE INFOGRAPH (AISUM Style inside Dark #111215 Block)  */}
      {/* 2-Column Header + 4 Portrait Cards (#1B1D24) with Large Numbers & Coral   */}
      {/* ========================================================================= */}
      <section className="relative z-10 bg-[#111215] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8 border-t border-black">
        <div className="container-shell max-w-7xl mx-auto space-y-12">
          {/* 2-Column Editorial Header (Image 2 - AISUM Style) */}
          <FadeInView>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-white/10 pb-8">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#F84632] uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>EVENT PULSE & METRICS</span>
                </div>
                <h2 className="font-[var(--font-display)] text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-white uppercase">
                  CONVENTION MEETS ACTION<span className="text-[#F84632]">*</span>
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
                  Direktori komprehensif ribuan kreator independen dan booth karya. Diindeks ke dalam arsitektur offline-first untuk keandalan maksimal di dalam hall konvensi tanpa ketergantungan sinyal.
                </p>
              </div>
            </div>
          </FadeInView>

          {/* 4 Portrait Metric Cards (Exact AISUM Style: Dark Gray Cards + Coral Accents) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {/* Metric 1: Circles */}
            <MetricCardMotion
              delay={0.05}
              glowColor="rgba(248, 70, 50, 0.25)"
              borderColor="rgba(248, 70, 50, 0.45)"
              className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-[#1B1D24] p-6 sm:p-8 min-h-[230px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#F84632] transition-colors">
                  {stats.totalCircles ? stats.totalCircles.toLocaleString("id-ID") : "1.487"}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <Users2 className="h-3.5 w-3.5 shrink-0" />
                  <span>CIRCLES</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Artist Alley & Creator Alley</p>
              </div>
            </MetricCardMotion>

            {/* Metric 2: Sampel Karya */}
            <MetricCardMotion
              delay={0.1}
              glowColor="rgba(248, 70, 50, 0.25)"
              borderColor="rgba(248, 70, 50, 0.45)"
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#1B1D24] p-6 sm:p-8 min-h-[230px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#F84632] transition-colors">
                  {stats.totalProducts ? stats.totalProducts.toLocaleString("id-ID") : "5.144"}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>SAMPEL KARYA</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Artbook, Merch, Standee & Zine</p>
              </div>
            </MetricCardMotion>

            {/* Metric 3: Hall Venue */}
            <MetricCardMotion
              delay={0.15}
              glowColor="rgba(248, 70, 50, 0.25)"
              borderColor="rgba(248, 70, 50, 0.45)"
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#1B1D24] p-6 sm:p-8 min-h-[230px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#F84632] transition-colors">
                  0{stats.totalHalls || 2}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>HALL VENUE</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Hall 8 & Hall 9 ICE BSD</p>
              </div>
            </MetricCardMotion>

            {/* Metric 4: Offline Ready */}
            <MetricCardMotion
              delay={0.2}
              glowColor="rgba(248, 70, 50, 0.25)"
              borderColor="rgba(248, 70, 50, 0.45)"
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#1B1D24] p-6 sm:p-8 min-h-[230px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#F84632] transition-colors">
                  100%
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <WifiOff className="h-3.5 w-3.5 shrink-0" />
                  <span>OFFLINE READY</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">Service Worker & Local Storage</p>
              </div>
            </MetricCardMotion>
          </div>
        </div>

        {/* Seamless Soft Transition into White Section 3 */}
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-b from-transparent via-[#252834]/40 to-[#FFFFFF] pointer-events-none" />
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: COMIFURO EDITIONS 16:9 LANDSCAPE BANNERS (PURE WHITE #FFFFFF)  */}
      {/* Judul Section Besar Coral Red (#F84632): 'COMIFURO EDITIONS'              */}
      {/* 6 Kartu banner berasio 16:9 Landscape (aspect-video) CF 23 s/d CF 18      */}
      {/* ========================================================================= */}
      <section className="relative z-10 bg-[#FFFFFF] px-4 py-20 text-[#111215] sm:px-6 md:py-28 lg:px-8 border-t border-zinc-200">
        <div className="container-shell max-w-7xl mx-auto space-y-12">
          {/* Section Header with Coral Red Title (TANALOKA Style) */}
          <FadeInView>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 pb-8">
              <div>
                <p className="text-xs font-mono font-bold tracking-widest text-[#F84632] uppercase">
                  COMIFURO EDITIONS & ARCHIVES
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight uppercase text-[#F84632]">
                  COMIFURO EDITIONS
                </h2>
                <p className="mt-2 text-sm text-zinc-600 max-w-xl">
                  Arsip direktori katalog dan denah booth Comic Frontier lintas edisi di ICE BSD City.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/circles"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-xs font-bold font-mono text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-xs"
                >
                  <span>LIHAT SEMUA CIRCLE</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-xs font-bold font-mono text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-xs"
                >
                  <span>SEMUA EVENT</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeInView>

          {/* 6 Event Banner Cards in 16:9 Landscape Aspect Ratio */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comifuroEditions.map((edition, idx) => (
              <FadeInView key={edition.id} delay={idx * 0.08} duration={0.45}>
                <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:border-[#F84632]/50 hover:shadow-xl hover:shadow-[#F84632]/10 h-full">
                  {/* 16:9 Thumbnail Banner with BannerCardMotion */}
                  <BannerCardMotion
                    imageSrc={edition.bannerImage}
                    imageAlt={edition.title}
                    badge={
                      <span className="rounded-lg bg-black/75 px-3 py-1 font-mono text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-md">
                        {edition.editionBadge}
                      </span>
                    }
                    className="rounded-t-2xl rounded-b-none border-0"
                  >
                    {/* Contrast scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

                    {/* Top Right Status Badge: CF 23 Coral Red, others dark charcoal */}
                    <div className="absolute top-3 right-3 z-20">
                      <BannerBadgeMotion>
                        <span
                          className={cn(
                            "rounded-full px-3 py-0.5 text-[11px] font-mono font-bold backdrop-blur-md shadow-md",
                            edition.status === "Coming Soon"
                              ? "bg-[#F84632] text-white"
                              : "bg-[#111215]/80 text-white border border-white/20"
                          )}
                        >
                          {edition.status}
                        </span>
                      </BannerBadgeMotion>
                    </div>

                    {/* Title overlay on bottom of banner */}
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <p className="font-[var(--font-display)] text-lg font-bold text-white group-hover:text-[#D6F834] transition-colors drop-shadow-md">
                        {edition.title}
                      </p>
                    </div>
                  </BannerCardMotion>

                  {/* Card Content & Metadata on White Background */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-500">
                        <div className="flex items-center gap-1 text-zinc-800 font-medium">
                          <Calendar className="h-3 w-3 text-[#F84632]" />
                          <span>{edition.date}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-zinc-400" />
                          <span className="truncate">{edition.venue}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                        {edition.description}
                      </p>
                    </div>

                    {/* Card Bottom Link */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                      <Link
                        href={edition.linkHref}
                        className="font-bold text-[#F84632] group-hover:underline inline-flex items-center gap-1"
                      >
                        <span>{edition.linkText}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                        {edition.editionBadge}
                      </span>
                    </div>
                  </div>
                </article>
              </FadeInView>
            ))}
          </div>

          {/* Quick Fandom & Category Tags on White Background */}
          <FadeInView delay={0.2}>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  PENCARIAN CEPAT FANDOM COMIFURO:
                </span>
                <Link href="/products" className="text-xs font-mono font-bold text-[#F84632] hover:underline">
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
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 transition hover:border-[#F84632] hover:text-[#F84632] hover:bg-[#F84632]/5"
                  >
                    {fandom}
                  </Link>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
}
