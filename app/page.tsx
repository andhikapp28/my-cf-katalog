export const revalidate = 120;

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
    <div className="relative min-h-screen bg-[#07090E] text-white selection:bg-[#FF6B4A]/30 selection:text-white">
      {/* Background Seamless Ambient Atmosphere (No solid color cuts) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        {/* Top radial ambient glow */}
        <div className="absolute -top-40 left-1/2 h-[560px] w-[800px] -translate-x-1/2 rounded-full bg-[#1E56C8]/18 blur-[140px]" />
        {/* Mid-right warm accent glow */}
        <div className="absolute top-[32rem] right-0 h-[480px] w-[480px] rounded-full bg-[#FF6B4A]/10 blur-[130px]" />
        {/* Bottom-left cool glow */}
        <div className="absolute bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-[#1E56C8]/10 blur-[140px]" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION (Spacious Composition + Clean Global Focus)        */}
      {/* ========================================================================= */}
      <section className="relative z-10 px-4 pt-12 pb-16 sm:px-6 md:pt-16 md:pb-24 lg:px-8">
        <div className="container-shell max-w-7xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Bold Typography, Subtext & Quick Action CTAs with Staggered Entrance */}
            <HeroEntranceMotion className="space-y-6 lg:col-span-7">
              <HeroEntranceItem>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-mono font-semibold tracking-wider text-[#FF6B4A] uppercase backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4A] animate-pulse" />
                  <span>COMIFURO COMPANION GUIDE</span>
                </div>
              </HeroEntranceItem>

              <HeroEntranceItem>
                <h1 className="font-[var(--font-display)] text-5xl font-black tracking-tight uppercase sm:text-6xl md:text-7xl lg:text-7xl leading-[0.94] text-white">
                  HUNTING <br />
                  <span className="text-white">COMIFURO</span> <br />
                  <span className="text-[#FF6B4A]">TANPA MATI SINYAL</span>*
                </h1>
              </HeroEntranceItem>

              <HeroEntranceItem>
                <p className="max-w-xl text-base sm:text-lg font-normal leading-relaxed text-white/75">
                  Katalog personal untuk menjelajahi ribuan circle kreator, denah booth ICE BSD, kalkulator cash ATM, dan checklist belanja yang aktif 100% saat offline.
                </p>
              </HeroEntranceItem>

              <HeroEntranceItem>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B4A] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#ff5733] active:scale-[0.98] shadow-lg shadow-[#FF6B4A]/25"
                  >
                    Jelajahi 1.400+ Circle
                  </Link>
                  <Link
                    href="/maps"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/30 active:scale-[0.98]"
                  >
                    Peta Denah Hall
                  </Link>
                  <PreloadOfflineButton
                    productIds={featuredProducts.map((p) => p.id)}
                    circleIds={featuredCircles.map((c) => c.id)}
                  />
                </div>
              </HeroEntranceItem>
            </HeroEntranceMotion>

            {/* Right Column: Spacious Mascot Staging Canvas with Viewport Entrance */}
            <FadeInView delay={0.15} duration={0.6} className="lg:col-span-5 flex items-center justify-center">
              <div className="relative flex w-full min-h-[340px] sm:min-h-[400px] lg:min-h-[440px] items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent p-8 backdrop-blur-sm group overflow-hidden">
                {/* Visual Halo & Comic Frame Accents */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,74,0.12),transparent_70%)]" />
                <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF6B4A]/40 to-transparent" />
                <div className="pointer-events-none absolute -bottom-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-[#FF6B4A]/20 blur-2xl" />

                {/* Frame Corner Accents */}
                <div className="absolute top-4 left-4 h-3 w-3 border-t-2 border-l-2 border-white/30" />
                <div className="absolute top-4 right-4 h-3 w-3 border-t-2 border-r-2 border-white/30" />
                <div className="absolute bottom-4 left-4 h-3 w-3 border-b-2 border-l-2 border-white/30" />
                <div className="absolute bottom-4 right-4 h-3 w-3 border-b-2 border-r-2 border-white/30" />

                {/* Mascot Stage Slot: Leluasa untuk penempatan aset maskot resmi user */}
                <div className="relative z-10 flex max-w-xs flex-col items-center text-center space-y-4">
                  <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-white/10 to-white/5 shadow-inner backdrop-blur-md">
                    <span className="font-[var(--font-display)] text-3xl sm:text-4xl font-black tracking-tighter text-[#FF6B4A]">
                      CP
                    </span>
                    <div className="pointer-events-none absolute inset-0 rounded-full border border-[#FF6B4A]/30 animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-white/90">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4A]" />
                      <span>MASCOT STAGE</span>
                    </div>
                    <p className="text-xs leading-relaxed text-white/50 pt-1">
                      Ruang spasial terbuka siap pakai untuk penempatan ilustrasi maskot resmi ComiPocket.
                    </p>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: DATA PULSE INFOGRAPH (AISUM Style - Image 2 Exact Replication)  */}
      {/* 2-Column Header (Left tag + Bold Heading, Right clean white desc)          */}
      {/* 4 Portrait Metric Cards with MetricCardMotion Natural Spring & Glow       */}
      {/* ========================================================================= */}
      <section className="relative z-10 border-t border-white/10 px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
        <div className="container-shell max-w-7xl mx-auto space-y-10">
          {/* 2-Column Header AISUM Style */}
          <FadeInView>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-white/10 pb-8">
              <div className="lg:col-span-7 space-y-2.5">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#FF6B4A] uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>EVENT PULSE & METRICS</span>
                </div>
                <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white uppercase">
                  CONVENTION MEETS ACTION<span className="text-[#FF6B4A]">*</span>
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm sm:text-base leading-relaxed text-white/70">
                  Direktori komprehensif ribuan kreator independen dan booth karya. Diindeks ke dalam arsitektur offline-first untuk keandalan maksimal di dalam hall konvensi.
                </p>
              </div>
            </div>
          </FadeInView>

          {/* 4 Portrait Metric Cards (AISUM Style) with MetricCardMotion */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {/* Metric 1: Circles */}
            <MetricCardMotion
              delay={0.05}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#151922] p-6 sm:p-7 min-h-[220px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                  {stats.totalCircles ? stats.totalCircles.toLocaleString("id-ID") : "1.478"}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#FF6B4A] uppercase">
                  <Users2 className="h-3.5 w-3.5 shrink-0" />
                  <span>CIRCLES</span>
                </div>
                <p className="mt-1 text-[11px] text-white/40">Artist Alley & Creator Alley</p>
              </div>
            </MetricCardMotion>

            {/* Metric 2: Sampel Karya */}
            <MetricCardMotion
              delay={0.1}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#151922] p-6 sm:p-7 min-h-[220px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                  {stats.totalProducts ? stats.totalProducts.toLocaleString("id-ID") : "5.144"}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#FF6B4A] uppercase">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>SAMPEL KARYA</span>
                </div>
                <p className="mt-1 text-[11px] text-white/40">Artbook, Merch, Standee & Zine</p>
              </div>
            </MetricCardMotion>

            {/* Metric 3: Hall Venue */}
            <MetricCardMotion
              delay={0.15}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#151922] p-6 sm:p-7 min-h-[220px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                  0{stats.totalHalls || 2}
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#FF6B4A] uppercase">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>HALL VENUE</span>
                </div>
                <p className="mt-1 text-[11px] text-white/40">Hall 8 & Hall 9 ICE BSD</p>
              </div>
            </MetricCardMotion>

            {/* Metric 4: Offline Ready */}
            <MetricCardMotion
              delay={0.2}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#151922] p-6 sm:p-7 min-h-[220px]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-[#FF6B4A] transition-colors">
                  100%
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#FF6B4A] uppercase">
                  <WifiOff className="h-3.5 w-3.5 shrink-0" />
                  <span>OFFLINE READY</span>
                </div>
                <p className="mt-1 text-[11px] text-white/40">Service Worker & Local Storage</p>
              </div>
            </MetricCardMotion>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: COMIFURO EDITIONS 16:9 LANDSCAPE BANNERS (CF 23 s/d CF 18)     */}
      {/* 16:9 Landscape cards with BannerCardMotion (Image Zoom & Badge Lift)      */}
      {/* ========================================================================= */}
      <section className="relative z-10 border-t border-white/10 px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
        <div className="container-shell max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <FadeInView>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-mono font-bold tracking-widest text-[#FF6B4A] uppercase">
                  COMIFURO EDITIONS & ARCHIVES
                </p>
                <h2 className="mt-1 font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase text-white">
                  COMIFURO EDITIONS
                </h2>
                <p className="mt-2 text-sm text-white/60 max-w-xl">
                  Arsip direktori katalog dan denah booth Comic Frontier lintas edisi di ICE BSD City.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/circles"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold font-mono text-white transition hover:bg-white/10 shadow-xs"
                >
                  <span>LIHAT SEMUA CIRCLE</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold font-mono text-white transition hover:bg-white/10 shadow-xs"
                >
                  <span>SEMUA EVENT</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeInView>

          {/* 6 Event Banner Cards in 16:9 Landscape Aspect Ratio with BannerCardMotion */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comifuroEditions.map((edition, idx) => (
              <FadeInView key={edition.id} delay={idx * 0.08} duration={0.45}>
                <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121620] transition duration-300 hover:border-[#FF6B4A]/50 hover:shadow-xl hover:shadow-[#FF6B4A]/10 h-full">
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
                    {/* Subtle Gradient Scrim for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-black/35 to-transparent pointer-events-none" />

                    {/* Top Right Status Badge with BannerBadgeMotion */}
                    <div className="absolute top-3 right-3 z-20">
                      <BannerBadgeMotion>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold backdrop-blur-md shadow-md",
                            edition.status === "Coming Soon"
                              ? "bg-[#FF6B4A] text-white"
                              : "bg-white/15 text-white/90 border border-white/15"
                          )}
                        >
                          {edition.status}
                        </span>
                      </BannerBadgeMotion>
                    </div>

                    {/* Title overlay on bottom of banner */}
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <p className="font-[var(--font-display)] text-lg font-bold text-white group-hover:text-[#FF6B4A] transition-colors drop-shadow-md">
                        {edition.title}
                      </p>
                    </div>
                  </BannerCardMotion>

                  {/* Card Content & Metadata */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-white/60">
                        <div className="flex items-center gap-1 text-white/80">
                          <Calendar className="h-3 w-3 text-[#FF6B4A]" />
                          <span>{edition.date}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-white/40" />
                          <span className="truncate">{edition.venue}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                        {edition.description}
                      </p>
                    </div>

                    {/* Card Bottom Link */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <Link
                        href={edition.linkHref}
                        className="font-bold text-[#FF6B4A] group-hover:underline inline-flex items-center gap-1"
                      >
                        <span>{edition.linkText}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      <span className="text-[11px] text-white/30 font-mono uppercase">
                        {edition.editionBadge}
                      </span>
                    </div>
                  </div>
                </article>
              </FadeInView>
            ))}
          </div>

          {/* Quick Fandom & Category Tags */}
          <FadeInView delay={0.2}>
            <div className="rounded-2xl border border-white/10 bg-[#121620] p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
                  PENCARIAN CEPAT FANDOM COMIFURO:
                </span>
                <Link href="/products" className="text-xs font-mono font-bold text-[#FF6B4A] hover:underline">
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
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 transition hover:border-[#FF6B4A] hover:bg-[#FF6B4A]/10 hover:text-white"
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
