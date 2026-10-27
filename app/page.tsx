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
import { CountdownTimer } from "@/components/landing/countdown-timer";
import {
  FadeInView,
  HeroEntranceMotion,
  HeroEntranceItem,
  MetricCardMotion,
  BannerCardMotion,
  BannerBadgeMotion
} from "@/components/landing/landing-motion";
import { CompanionToolkit } from "@/components/landing/companion-toolkit";
import { getEventsWithCounts, getLandingPageData } from "@/db/queries";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [data, eventsList] = await Promise.all([
    getLandingPageData(),
    getEventsWithCounts()
  ]);

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

  const { featuredCircles, featuredProducts, stats } = data;

  const editions = eventsList.slice(0, 6).map((ev) => {
    const isUpcoming = ev.startsAt ? new Date(ev.startsAt) > new Date() : false;
    const status: "Coming Soon" | "Active Event" | "Past Event" = ev.isActive
      ? "Active Event"
      : isUpcoming
        ? "Coming Soon"
        : "Past Event";

    const badge = ev.slug.toUpperCase().replace(/^CF/, "CF ");

    return {
      id: ev.id,
      slug: ev.slug,
      editionBadge: badge,
      title: ev.name,
      status,
      date: formatDateRange(ev.startsAt, ev.endsAt),
      venue: ev.venue,
      bannerImage: ev.bannerImageUrl || `/banner/${ev.slug}.jpg`,
      linkHref: `/events/${ev.slug}`,
      linkText: ev.isActive ? "Detail Event" : "Lihat Arsip",
      description: ev.description || "",
      circleCount: ev.circleCount
    };
  });

  return (
    <div className="relative min-h-screen selection:bg-[#D6F834] selection:text-[#111215]">
      {/* SECTION 1: HERO */}
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
                <p className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#D6F834] uppercase leading-none">
                  Where Every Creator Gathers
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
                <p className="font-sans text-xs font-bold tracking-widest text-white/90 uppercase">
                  Kurasi Konvensi · ICE BSD City
                </p>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-none sm:text-right">
                  Hunting Tanpa Mati Sinyal
                </p>
              </HeroEntranceItem>
              <HeroEntranceItem>
                <p className="text-xs sm:text-sm font-medium text-white/80 max-w-xs sm:ml-auto leading-relaxed">
                  1.957 circle kreator, denah booth, kalkulator cash ATM, dan checklist offline.
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
                className="h-[250px] sm:h-[400px] md:h-[500px] lg:h-[580px] w-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)] select-none"
              />
            </div>
          </div>

          <HeroEntranceMotion className="relative z-20 flex flex-wrap items-center justify-center gap-3 pt-2 sm:pt-4">
            <HeroEntranceItem>
              <Link
                href="/circles"
                className="inline-flex items-center justify-center rounded-full bg-[#D6F834] px-8 py-3.5 text-sm font-extrabold text-[#111215] shadow-xl hover:bg-[#cbf128] transition active:scale-[0.98] uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2"
              >
                JELAJAHI {stats.totalCircles ? stats.totalCircles.toLocaleString("id-ID") : "1.959"} CIRCLE
              </Link>
            </HeroEntranceItem>

            <HeroEntranceItem>
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                Arsip Edisi Event
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

      {/* SECTION 2: EVENT PULSE & COUNTDOWN (COMIFURO 23 AKTIF) */}
      <section className="relative z-10 bg-[#D6F834] px-4 py-14 text-[#111215] sm:px-6 md:py-20 lg:py-24 border-t border-black/10">
        <div className="container-shell max-w-7xl mx-auto space-y-10 sm:space-y-12">
          <FadeInView>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-black/15 pb-8">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-sans font-bold tracking-wider text-[#111215] uppercase bg-black/10 px-3.5 py-1.5 rounded-full border border-black/10 shadow-xs">
                  <span>Comifuro 23 · Event Aktif</span>
                </div>
                <h2 className="font-sans text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-[#111215] uppercase leading-[0.92]">
                  Convention Meets Action
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm sm:text-base leading-relaxed text-[#111215]/85 font-medium">
                  Direktori {stats.totalCircles.toLocaleString("id-ID")} kreator independen dan booth aktif {data.event.name}. Disimpan langsung ke memori offline peramban agar tetap cepat diakses di tengah hall tanpa bergantung pada sinyal seluler.
                </p>
              </div>
            </div>
          </FadeInView>

          {/* LIVE COUNTDOWN TIMER */}
          <div className="relative z-20">
            <CountdownTimer />
          </div>

          {/* 4 METRIC CARDS */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            <MetricCardMotion
              delay={0.05}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  {stats.totalCircles.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-sans font-bold tracking-wider text-[#F84632] uppercase">
                  <Users2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Circles</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 font-sans">Artist Alley & Creator Alley terdaftar</p>
              </div>
            </MetricCardMotion>

            <MetricCardMotion
              delay={0.1}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  {stats.totalProducts ? stats.totalProducts.toLocaleString("id-ID") : "0"}
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-sans font-bold tracking-wider text-[#F84632] uppercase">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>Sampel Karya</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 font-sans">Katalog & artbook terkurasi</p>
              </div>
            </MetricCardMotion>

            <MetricCardMotion
              delay={0.15}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  0{stats.totalHalls || 6}
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-sans font-bold tracking-wider text-[#F84632] uppercase">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>Hall Venue</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 font-sans">Hall 5 - 10 ICE BSD City</p>
              </div>
            </MetricCardMotion>

            <MetricCardMotion
              delay={0.2}
              glowColor="rgba(0, 0, 0, 0.12)"
              borderColor="rgba(0, 0, 0, 0.25)"
              className="group flex flex-col justify-between rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 min-h-[230px] shadow-xl hover:shadow-2xl text-[#111215]"
            >
              <div>
                <div className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors">
                  100%
                </div>
              </div>
              <div className="pt-6 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs font-sans font-bold tracking-wider text-[#F84632] uppercase">
                  <WifiOff className="h-3.5 w-3.5 shrink-0" />
                  <span>Offline Ready</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 font-sans">Service Worker & Local Storage</p>
              </div>
            </MetricCardMotion>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-b from-transparent via-[#ebfcb9]/60 to-[#FFFFFF] pointer-events-none" />
      </section>

      {/* SECTION 3: COMIFURO EDITIONS ARSIP */}
      <section className="relative z-10 bg-[#FFFFFF] px-4 py-14 text-[#111215] sm:px-6 md:py-20 lg:py-24 border-t border-zinc-200">
        <div className="container-shell max-w-7xl mx-auto space-y-12">
          <FadeInView>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 pb-8">
              <div>
                <h2 className="mt-2 font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111215]">
                  Comifuro Editions
                </h2>
                <p className="mt-2 text-sm text-zinc-600 max-w-xl">
                  Arsip direktori katalog dan denah booth Comic Frontier lintas edisi di ICE BSD City.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/circles"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-xs font-semibold font-sans text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  <span>Semua Circle</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-xs font-semibold font-sans text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  <span>Semua Event</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeInView>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {editions.map((edition, idx) => (
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
                        <span className="rounded-lg bg-black/85 px-3 py-1 font-mono text-xs font-bold text-white border border-white/20 shadow-md">
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
                              "rounded-full px-3 py-0.5 text-xs font-sans font-semibold shadow-md",
                              edition.status === "Coming Soon"
                                ? "bg-[#F84632] text-white"
                                : edition.status === "Active Event"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#111215]/85 text-white border border-white/20"
                            )}
                          >
                            {edition.status}
                          </span>
                        </BannerBadgeMotion>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <p className="font-sans text-base sm:text-lg font-bold text-white group-hover:text-[#D6F834] transition-colors drop-shadow-md">
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
                        {edition.circleCount > 0 && (
                          <>
                            <span>·</span>
                            <div className="flex items-center gap-1 text-zinc-700 font-medium">
                              <Users2 className="h-3 w-3 text-zinc-400" />
                              <span>{edition.circleCount.toLocaleString("id-ID")} Circle</span>
                            </div>
                          </>
                        )}
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

      {/* SECTION 4: COMPANION TOOLKIT */}
      <CompanionToolkit />
    </div>
  );
}
