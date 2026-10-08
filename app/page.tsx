export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Layers,
  MapPin,
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
import { CompanionToolkit } from "@/components/landing/companion-toolkit";
import { getLandingPageData } from "@/db/queries";
import { cn } from "@/lib/utils";

interface ComifuroEdition {
  id: string;
  editionBadge: string;
  title: string;
  status: "Coming Soon" | "Active Event" | "Past Event";
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
    date: "31 Okt - 1 Nov 2026",
    venue: "ICE BSD City (Hall 6 - 10 & Hall 5)",
    bannerImage: "/banner/cf23.jpg",
    linkHref: "/events/cf23",
    linkText: "Detail Event",
    description: "Edisi Halloween dengan 1.500+ circle dan community booth."
  },
  {
    id: "cf22",
    editionBadge: "CF 22",
    title: "Comic Frontier 22",
    status: "Active Event",
    date: "16 - 17 Mei 2026",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImage: "/banner/cf22.jpg",
    linkHref: "/events/cf22",
    linkText: "Buka Katalog",
    description: "1.500+ circle kreator, Bushiroad EXPO, dan tiket KMT KAI."
  },
  {
    id: "cf21",
    editionBadge: "CF 21",
    title: "Comic Frontier 21",
    status: "Past Event",
    date: "15 - 16 November 2025",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImage: "/banner/cf21.jpg",
    linkHref: "/events/cf21",
    linkText: "Lihat Arsip",
    description: "Rekor 70.000 pengunjung dan konser akbar hololive ID."
  },
  {
    id: "cf20",
    editionBadge: "CF 20",
    title: "Comic Frontier 20",
    status: "Past Event",
    date: "24 - 25 Mei 2025",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImage: "/banner/cf20.jpg",
    linkHref: "/events/cf20",
    linkText: "Lihat Arsip",
    description: "Edisi ke-20 (CF XX), Bushiroad EXPO, dan temu kreator."
  },
  {
    id: "cf19",
    editionBadge: "CF 19",
    title: "Comic Frontier 19",
    status: "Past Event",
    date: "9 - 10 November 2024",
    venue: "ICE BSD City (Hall 7 - 10)",
    bannerImage: "/banner/cf19.jpg",
    linkHref: "/events/cf19",
    linkText: "Lihat Arsip",
    description: "Konser anisong Konomi Suzuki dan panggung musik J-pop."
  },
  {
    id: "cf18",
    editionBadge: "CF 18",
    title: "Comic Frontier 18",
    status: "Past Event",
    date: "11 - 12 Mei 2024",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImage: "/banner/cf18.jpg",
    linkHref: "/events/cf18",
    linkText: "Lihat Arsip",
    description: "Bushiroad EXPO 2024 dan temu bintang seiyuu Jepang."
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
      <section className="relative z-10 overflow-hidden bg-[#5398DA] text-white pt-8 pb-20 sm:pb-28 lg:pb-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
          <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-[#D6F834]/15 blur-[100px]" />
        </div>

        <div className="container-shell max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-6 pt-2">
            <HeroEntranceMotion className="space-y-2">
              <HeroEntranceItem>
                <p className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#D6F834] uppercase leading-none">
                  WHERE EVERY CREATOR GATHERS
                </p>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="text-xs sm:text-sm font-medium text-white/90 max-w-xs leading-relaxed">
                  Kurasi independen untuk kreator komik, kolektor doujin, dan pemburu merchandise Comic Frontier.
                </p>
              </HeroEntranceItem>
            </HeroEntranceMotion>

            <HeroEntranceMotion className="space-y-2 sm:text-right hidden sm:block">
              <HeroEntranceItem>
                <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase">
                  CURATED FOR CONVENTIONS · ICE BSD CITY
                </p>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="font-[var(--font-display)] text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-none sm:text-right">
                  HUNTING TANPA MATI SINYAL<span className="text-[#F84632]">*</span>
                </p>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="text-xs sm:text-sm font-medium text-white/80 max-w-xs sm:ml-auto leading-relaxed">
                  1.400+ circle kreator, denah booth, kalkulator cash ATM, dan checklist offline.
                </p>
              </HeroEntranceItem>
            </HeroEntranceMotion>
          </div>
          <div className="relative w-full min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[640px] flex items-center justify-center pt-2 sm:pt-4">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <span className="font-[var(--font-display)] font-black text-[12.8vw] tracking-tight w-full text-center text-[#D6F834] uppercase leading-none select-none drop-shadow-sm whitespace-nowrap opacity-95">
                COMIPOCKET
              </span>
            </div>
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
          <HeroEntranceMotion className="relative z-20 flex flex-wrap items-center justify-center gap-3 pt-2 sm:pt-4">
            <HeroEntranceItem>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[#D6F834] px-8 py-3.5 text-sm font-extrabold text-[#111215] shadow-xl hover:bg-[#cbf128] transition active:scale-[0.98] uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2"
              >
                JELAJAHI 1.400+ CIRCLE
              </Link>
            </HeroEntranceItem>

            <HeroEntranceItem>
              <Link
                href="/maps"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
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
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-b from-transparent via-[#88c592]/50 to-[#D6F834] pointer-events-none" />
      </section>
      <section className="relative z-10 bg-[#D6F834] px-4 py-20 text-[#111215] sm:px-6 md:py-28 lg:px-8 border-t border-black/10">
        <div className="container-shell max-w-7xl mx-auto space-y-12">
          <FadeInView>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-black/15 pb-8">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#111215] uppercase bg-black/10 px-3.5 py-1.5 rounded-full border border-black/10 shadow-xs">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                  <span>COMIFURO 22 · DATA EVENT AKTIF</span>
                </div>
                <h2 className="font-[var(--font-display)] text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-[#111215] uppercase leading-[0.92]">
                  CONVENTION MEETS ACTION<span className="text-[#F84632]">*</span>
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm sm:text-base leading-relaxed text-[#111215]/85 font-medium">
                  Direktori ribuan kreator independen dan booth aktif Comic Frontier 22. Disimpan langsung ke memori offline peramban agar tetap cepat diakses di tengah hall tanpa bergantung pada sinyal seluler.
                </p>
              </div>
            </div>
          </FadeInView>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <MetricCardMotion
              delay={0.05}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  {stats.totalCircles ? stats.totalCircles.toLocaleString("id-ID") : "0"}
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <Users2 className="h-3.5 w-3.5 shrink-0" />
                  <span>CIRCLES</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-600 font-mono">Artist Alley & Creator Alley</p>
              </div>
            </MetricCardMotion>
            <MetricCardMotion
              delay={0.1}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  {stats.totalProducts ? stats.totalProducts.toLocaleString("id-ID") : "0"}
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>SAMPEL KARYA</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-600 font-mono">Artbook, Merch, Standee & Zine</p>
              </div>
            </MetricCardMotion>
            <MetricCardMotion
              delay={0.15}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  0{stats.totalHalls || 2}
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>HALL VENUE</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-600 font-mono">Hall 8 & Hall 9 ICE BSD</p>
              </div>
            </MetricCardMotion>
            <MetricCardMotion
              delay={0.2}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  100%
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F84632] uppercase">
                  <WifiOff className="h-3.5 w-3.5 shrink-0" />
                  <span>OFFLINE READY</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-600 font-mono">Service Worker & Local Storage</p>
              </div>
            </MetricCardMotion>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-b from-transparent via-[#ebfcb9]/60 to-[#FFFFFF] pointer-events-none" />
      </section>
      <section className="relative z-10 bg-[#FFFFFF] px-4 py-20 text-[#111215] sm:px-6 md:py-28 lg:px-8 border-t border-zinc-200">
        <div className="container-shell max-w-7xl mx-auto space-y-12">
          <FadeInView>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 pb-8">
              <div>
                <h2 className="mt-2 font-[var(--font-display)] text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight uppercase text-[#F84632]">
                  COMIFURO EDITIONS
                </h2>
                <p className="mt-2 text-sm text-zinc-600 max-w-xl">
                  Arsip direktori katalog dan denah booth Comic Frontier lintas edisi di ICE BSD City.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/circles"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-xs font-bold font-mono text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  <span>SEMUA CIRCLE</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-xs font-bold font-mono text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  <span>SEMUA EVENT</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeInView>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comifuroEditions.map((edition, idx) => (
              <FadeInView key={edition.id} delay={idx * 0.08} duration={0.45}>
                <article className="h-full">
                  <Link
                    href={edition.linkHref}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-[#F84632]/50 hover:shadow-2xl hover:shadow-[#F84632]/15 hover:scale-[1.015] hover:-translate-y-1 h-full block"
                  >
                    <BannerCardMotion
                      imageSrc={edition.bannerImage}
                      imageAlt={edition.title}
                      badge={
                        <span className="rounded-lg bg-black/75 px-3 py-1 font-mono text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-md">
                          {edition.editionBadge}
                        </span>
                      }
                      className="aspect-[16/9] rounded-t-2xl rounded-b-none border-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                      <div className="absolute top-3 right-3 z-20">
                        <BannerBadgeMotion>
                          <span
                            className={cn(
                              "rounded-full px-3 py-0.5 text-[11px] font-mono font-bold backdrop-blur-md shadow-md",
                              edition.status === "Coming Soon"
                                ? "bg-[#F84632] text-white"
                                : edition.status === "Active Event"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#111215]/80 text-white border border-white/20"
                            )}
                          >
                            {edition.status}
                          </span>
                        </BannerBadgeMotion>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <p className="font-[var(--font-display)] text-lg font-bold text-white group-hover:text-[#D6F834] transition-colors drop-shadow-md">
                          {edition.title}
                        </p>
                      </div>
                    </BannerCardMotion>
                    <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
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
                  </Link>
                </article>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>
      <CompanionToolkit />
    </div>
  );
}
