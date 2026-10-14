"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  CheckSquare,
  ArrowUpRight,
  WifiOff,
  Check,
  Search
} from "lucide-react";
import { FadeInView } from "@/components/landing/landing-motion";
import { cn } from "@/lib/utils";

export interface SurvivalToolkitItem {
  id: string;
  title: string;
  tag: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  highlights: string[];
  mockData: {
    label: string;
    items: { label: string; value: string; active?: boolean }[];
  };
  linkHref: string;
  linkText: string;
}

export const SURVIVAL_TOOLKIT_ITEMS: SurvivalToolkitItem[] = [
  {
    id: "interactive-map",
    title: "Pencarian Booth & Meja Circle",
    tag: "BOOTH COORDINATES",
    badge: "1.400+ CIRCLE",
    icon: Store,
    description:
      "Telusuri 1.400+ circle kreator independen, nomor meja booth (misal A-15a, TC-12), dan jadwal hari kehadiran (Day 1 / Day 2) dengan cepat dan akurat.",
    highlights: [
      "Pencarian koordinat booth presisi (A-15a, TC-12) hingga nomor meja",
      "Filter kehadiran jadwal stan: Day 1 (Sabtu) vs Day 2 (Minggu)",
      "Urutan nomor meja natural untuk susun rute jalan di venue"
    ],
    mockData: {
      label: "KOORDINAT MEJA CIRCLE",
      items: [
        { label: "Booth A-15a", value: "Creator Alley · Day 1", active: true },
        { label: "Booth TC-12", value: "Artist Alley · Day 2", active: true },
        { label: "Status Data", value: "1.477 Circle Terverifikasi", active: false }
      ]
    },
    linkHref: "/circles",
    linkText: "Buka Direktori Circle"
  },
  {
    id: "cash-calculator",
    title: "Circle Tersimpan (Bookmark)",
    tag: "BOOKMARK STAN",
    badge: "INSTANT SAVE",
    icon: CheckSquare,
    description:
      "Tandai circle incaranmu dengan satu klik tanpa perlu repot login akun. Semua bookmark tersimpan aman di perambanmu dan siap dibuka saat hari-H.",
    highlights: [
      "Simpan stan circle incaran langsung dari direktori",
      "100% Client Storage: Bebas repot login dan anti ter-logout",
      "Urutkan circle tersimpan berdasarkan nomor lorong meja"
    ],
    mockData: {
      label: "CIRCLE TERSIMPAN",
      items: [
        { label: "Koleksi Bookmark", value: "Tersimpan di Browser", active: true },
        { label: "Mode Akses", value: "Siap Dibuka Tanpa Sinyal", active: false },
        { label: "Navigasi", value: "Berdasarkan Nomor Meja", active: true }
      ]
    },
    linkHref: "/wishlist",
    linkText: "Lihat Circle Tersimpan"
  },
  {
    id: "offline-wishlist",
    title: "Akses 100% Offline PWA",
    tag: "OFFLINE FIRST",
    badge: "ANTI BLANK-SPOT",
    icon: WifiOff,
    description:
      "Dirancang offline-first untuk mengatasi kendala blank spot dan cellular jam di dalam hall ICE BSD. Direktori circle dan bookmark tetap responsif tanpa koneksi.",
    highlights: [
      "Service worker caching untuk direktori circle dan metadata",
      "Zero latency browsing di tengah kerumunan hall yang padat",
      "Data ringan dan ramah baterai ponsel selama berburu karya"
    ],
    mockData: {
      label: "STATUS KESIAPAN OFFLINE",
      items: [
        { label: "Service Worker", value: "Active & Cached", active: true },
        { label: "Penyimpanan", value: "Local Storage & IndexedDB", active: false },
        { label: "Koneksi", value: "Bebas Kuota Internet", active: true }
      ]
    },
    linkHref: "/circles",
    linkText: "Jelajahi Offline PWA"
  }
];

export interface HuntingFlowStep {
  step: string;
  stepNumber: string;
  phaseBadge: string;
  title: string;
  description: string;
  highlights: string[];
  icon: React.ElementType;
  linkHref: string;
  linkText: string;
}

export const HUNTING_FLOW_STEPS: HuntingFlowStep[] = [
  {
    step: "01",
    stepNumber: "STEP 01",
    phaseBadge: "H-7 S/D H-1 · PERSIAPAN DI RUMAH",
    title: "Riset & Tandai Circle di Rumah",
    description:
      "Sisir 1.400+ circle kreator, telusuri karya dan fandom favorit, lalu tandai circle incaran ke daftar tersimpan sebelum berangkat ke venue.",
    highlights: [
      "Telusuri direktori 1.400+ circle kreator dan ribuan karya",
      "Tandai booth incaran dengan tombol hati untuk bookmark",
      "Filter berdasarkan fandom favorit dan jadwal hari kehadiran"
    ],
    icon: Search,
    linkHref: "/circles",
    linkText: "Buka Direktori Circle"
  },
  {
    step: "02",
    stepNumber: "STEP 02",
    phaseBadge: "HARI-H 08:00 WIB · SEBELUM MASUK GATE",
    title: "Cek Jadwal & Rute Kunjungan",
    description:
      "Buka daftar circle tersimpan untuk memilah stan yang buka di Day 1 (Sabtu) atau Day 2 (Minggu) agar rute jalanmu di venue efisien.",
    highlights: [
      "Pisahkan target kunjungan berdasarkan hari kehadiran booth",
      "Urutkan daftar circle berdasarkan nomor meja lorong hall",
      "Siap dibuka langsung tanpa perlu login akun atau koneksi server"
    ],
    icon: CheckSquare,
    linkHref: "/wishlist",
    linkText: "Cek Circle Tersimpan"
  },
  {
    step: "03",
    stepNumber: "STEP 03",
    phaseBadge: "HARI-H 10:00+ WIB · DI DALAM LANTAI HALL",
    title: "Berburu Meja Stan Tanpa Sinyal",
    description:
      "Akses direktori circle & bookmark secara offline langsung dari ponsel di dalam venue. Temukan posisi nomor meja seperti A-15a atau TC-12 tanpa kendala jaringan.",
    highlights: [
      "Akses direktori circle 100% offline via Service Worker PWA",
      "Pencarian cepat nomor meja booth kreator di lorong hall",
      "Semua data tersimpan aman di peramban tanpa terpengaruh sinyal drop"
    ],
    icon: WifiOff,
    linkHref: "/circles",
    linkText: "Buka Direktori Offline"
  }
];

export interface CompanionToolkitSectionProps {
  className?: string;
  id?: string;
}

export function CompanionToolkitSection({
  className,
  id = "companion-toolkit"
}: CompanionToolkitSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-10 bg-[#F0F5FA] px-4 py-14 text-[#111215] sm:px-6 md:py-20 lg:py-24 border-t border-sky-100/80",
        className
      )}
    >
      <div className="container-shell max-w-7xl mx-auto space-y-12">
        <FadeInView>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-sky-200/60 pb-8">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="font-[var(--font-display)] text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-[#111215] uppercase leading-[0.92]">
                EVENT DAY SURVIVAL & COMPANION TOOLKIT<span className="text-[#F84632]">*</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base leading-relaxed text-zinc-600 font-medium">
                Tiga instrumen taktis yang dirancang khusus mengatasi kendala nyata hari-H Comic Frontier:
                blackout sinyal seluler, antrean padat, dan navigasi ribuan booth di ICE BSD.
              </p>
            </div>
          </div>
        </FadeInView>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SURVIVAL_TOOLKIT_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <FadeInView key={item.id} delay={idx * 0.1} duration={0.45}>
                <article className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-sky-100/90 bg-white p-6 sm:p-8 shadow-sm hover:border-[#F84632]/50 hover:shadow-xl hover:shadow-[#F84632]/5 transition-all duration-300">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F84632]/10 text-[#F84632] group-hover:bg-[#F84632] group-hover:text-white transition-colors duration-300">
                        <Icon className="h-6 w-6 shrink-0" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors duration-200">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        FITUR UTAMA:
                      </p>
                      <ul className="space-y-2 text-xs text-zinc-700">
                        {item.highlights.map((highlight, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F84632]/15 text-[#F84632]">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-tight font-medium">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-3.5 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-zinc-500 uppercase border-b border-zinc-200 pb-1.5">
                        <span>{item.mockData.label}</span>
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        {item.mockData.items.map((mock, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-center justify-between gap-2 text-[11px]"
                          >
                            <span className="text-zinc-600 font-semibold">{mock.label}:</span>
                            <span
                              className={cn(
                                "truncate font-mono font-bold",
                                mock.active ? "text-[#F84632]" : "text-zinc-800"
                              )}
                            >
                              {mock.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <Link
                      href={item.linkHref}
                      className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs font-bold text-[#F84632] group-hover:text-[#111215] transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] rounded-md"
                    >
                      <span>{item.linkText}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <span className="font-mono text-[10px] font-semibold text-zinc-600">
                      TANALOKA PROTOCOL
                    </span>
                  </div>
                </article>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export interface ConventionHuntingFlowSectionProps {
  className?: string;
  id?: string;
}

export function ConventionHuntingFlowSection({
  className,
  id = "hunting-flow"
}: ConventionHuntingFlowSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-10 overflow-hidden bg-[#E2F874] px-4 py-20 text-[#111215] sm:px-6 md:py-28 lg:px-8",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-24 sm:h-36 bg-gradient-to-b from-[#F0F5FA] via-[#EAF7B0]/75 to-transparent pointer-events-none z-1" />

      <div className="container-shell max-w-7xl mx-auto space-y-12 relative z-10">
        <FadeInView>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end border-b border-black/15 pb-8">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="font-[var(--font-display)] text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-[#111215] uppercase leading-[0.92]">
                3-STEP CONVENTION HUNTING FLOW<span className="text-[#F84632]">*</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base leading-relaxed text-[#111215]/85 font-medium">
                Alur taktis terstruktur dari persiapan kamar tidur hingga berburu rilisan eksklusif di lantai hall tanpa hambatan mati sinyal.
              </p>
            </div>
          </div>
        </FadeInView>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          {HUNTING_FLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <FadeInView key={step.step} delay={idx * 0.12} duration={0.45}>
                <div className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border-2 border-black/10 bg-white p-6 sm:p-8 shadow-xl hover:border-[#F84632]/50 hover:shadow-2xl hover:shadow-[#F84632]/10 transition-all duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-black/10 pb-3">
                      <span className="font-[var(--font-display)] text-5xl sm:text-6xl font-black tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors duration-200">
                        {step.step}
                      </span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5 text-[#111215] border border-black/10 group-hover:bg-[#F84632] group-hover:text-white transition-colors duration-300">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        ACTION CHECKLIST:
                      </p>
                      <ul className="space-y-2 text-xs text-zinc-700">
                        {step.highlights.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F84632]/15 text-[#F84632]">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-tight font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <Link
                      href={step.linkHref}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#F84632] group-hover:text-[#111215] transition-colors active:scale-[0.98]"
                    >
                      <span>{step.linkText}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase">
                      FASE {step.step} DARI 03
                    </span>
                  </div>
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-b from-transparent via-[#f0fbbd]/60 to-[#FFFFFF] pointer-events-none z-1" />
    </section>
  );
}

export interface CompanionToolkitProps {
  className?: string;
  showToolkit?: boolean;
  showHuntingFlow?: boolean;
}

export function CompanionToolkit({
  className,
  showToolkit = true,
  showHuntingFlow = true
}: CompanionToolkitProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {showToolkit && <CompanionToolkitSection />}
      {showHuntingFlow && <ConventionHuntingFlowSection />}
    </div>
  );
}
export const EventDaySurvivalToolkit = CompanionToolkitSection;
export const ThreeStepHuntingFlow = ConventionHuntingFlowSection;

export default CompanionToolkit;
