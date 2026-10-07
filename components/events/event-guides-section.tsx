"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Info,
  Layers,
  ShieldAlert,
  Sparkles,
  Ticket,
  Train
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EventDetailMetadata } from "@/lib/event-details-data";
import { cn } from "@/lib/utils";

type GuideTabId = "all" | "tickets" | "highlights" | "transport" | "rules";

interface GuideTabItem {
  id: GuideTabId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const GUIDE_TABS: GuideTabItem[] = [
  { id: "all", label: "Semua Panduan", shortLabel: "Semua", icon: Layers },
  { id: "tickets", label: "Tiket & Waktu Akses Gate", shortLabel: "Tiket & Gate", icon: Ticket },
  { id: "highlights", label: "Sorotan Utama & Tamu", shortLabel: "Sorotan", icon: Sparkles },
  { id: "transport", label: "Transportasi & Shuttle Bus", shortLabel: "Transportasi", icon: Bus },
  { id: "rules", label: "Regulasi Komunitas & Cosplay", shortLabel: "Regulasi", icon: ShieldAlert }
];

export function EventGuidesSection({ data }: { data: EventDetailMetadata }) {
  const [activeTab, setActiveTab] = useState<GuideTabId>("all");

  const showTickets = activeTab === "all" || activeTab === "tickets";
  const showHighlights = activeTab === "all" || activeTab === "highlights";
  const showTransport = activeTab === "all" || activeTab === "transport";
  const showRules = activeTab === "all" || activeTab === "rules";

  return (
    <section className="space-y-6 pt-4">
      {/* ========================================================================= */}
      {/* 1. SECTION HEADER & TAB CONTROLS (TANALOKA EDITORIAL STYLE)              */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-4 border-b border-line/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-brand-700">
            <Info className="h-3.5 w-3.5 text-brand-600" />
            <span>PANDUAN OPERASIONAL & REGULASI RESMI</span>
          </div>
          <h2 className="mt-2.5 font-[var(--font-display)] text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Panduan Lengkap & Regulasi {data.editionName}
          </h2>
          <p className="mt-1 text-sm text-ink-500 sm:text-base">
            Informasi tiket, estimasi keramaian, panduan rute shuttle gratis Lorena, serta tata tertib resmi ICE BSD.
          </p>
        </div>

        {/* Tab Controls Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-line bg-stone-100/80 p-1.5 shadow-xs scrollbar-none sm:shrink-0">
          {GUIDE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all sm:text-sm",
                  isActive
                    ? "bg-ink-900 font-semibold text-white shadow-xs"
                    : "text-ink-700 hover:bg-white/80 hover:text-ink-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-brand-400" : "text-ink-500")} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD 1: SEKSI TIKET & WAKTU AKSES GATE                                 */}
      {/* ========================================================================= */}
      {showTickets && (
        <Card className="overflow-hidden border border-line/80 bg-card/95 shadow-soft">
          <CardContent className="space-y-6 p-5 sm:p-7">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-700">
                      OFFICIAL TICKETING & GATE ACCESS
                    </span>
                    <Badge className="bg-brand-500/10 text-brand-700 ring-brand-600/20">
                      {data.ticketInfo.salesModel}
                    </Badge>
                  </div>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-ink-900 sm:text-2xl">
                    Seksi Tiket & Waktu Akses Gate
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Calendar className="h-4 w-4 text-brand-600" />
                <span>{data.datesText}</span>
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Platform */}
              <div className="rounded-2xl border border-line bg-white/70 p-4 transition hover:border-brand-300">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  PLATFORM RESMI
                </span>
                <p className="mt-1 font-[var(--font-display)] text-xl font-bold text-ink-900">
                  {data.ticketInfo.platform}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {data.ticketInfo.salesModel}
                </p>
              </div>

              {/* Reguler */}
              <div className="rounded-2xl border border-line bg-white/70 p-4 transition hover:border-brand-300">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  TIKET REGULER
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-ink-900">
                  {data.ticketInfo.regularPriceFormatted}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Akses pameran 1 hari / pengunjung
                </p>
              </div>

              {/* Bundle */}
              <div className="rounded-2xl border border-line bg-white/70 p-4 transition hover:border-brand-300">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  TIKET BUNDLE MERCH
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-ink-900">
                  {data.ticketInfo.bundlePriceFormatted || "Tidak Tersedia"}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Termasuk paket official merchandise
                </p>
              </div>

              {/* Estimasi Kehadiran */}
              <div className="rounded-2xl border border-line bg-white/70 p-4 transition hover:border-brand-300">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  ESTIMASI PENGUNJUNG
                </span>
                <p className="mt-1 font-mono text-lg font-bold text-ink-900">
                  {data.attendance.estimatedAttendees}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {data.attendance.venueHalls}
                </p>
              </div>
            </div>

            {/* Gate Timeline & Schedule Track */}
            <div className="rounded-2xl border border-line/80 bg-stone-50/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-600" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">
                  JADWAL OPERASIONAL GERBANG & PENUKARAN WRISTBAND
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="relative rounded-xl border border-line bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-brand-700">08:00 WIB</span>
                    <Badge className="bg-emerald-500/10 text-emerald-800 ring-emerald-600/20">BUKA</Badge>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink-900">Mulai Penukaran Wristband</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                    Loket penukaran e-voucher barcode menjadi gelang wristband resmi dibuka di lobi Hall 10.
                  </p>
                </div>

                <div className="relative rounded-xl border border-line bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-700">{data.ticketInfo.wristbandExchangeHours.split("-")[1]?.trim() || "18:15 WIB"}</span>
                    <Badge className="bg-amber-500/10 text-amber-800 ring-amber-600/20">CUT-OFF</Badge>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink-900">Batas Penukaran Gelang</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                    Meja scan dan penukaran tiket fisik ditutup. Pastikan sudah menukar sebelum batas waktu.
                  </p>
                </div>

                <div className="relative rounded-xl border border-line bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-rose-700">{data.ticketInfo.gateCloseHour}</span>
                    <Badge className="bg-rose-500/10 text-rose-800 ring-rose-600/20">GATE CLOSE</Badge>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink-900">Pintu Masuk Hall Ditutup</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                    Pintu masuk hall ditutup total untuk seluruh pengunjung. Harap perhatikan waktu kedatangan.
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Callout */}
            <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <div className="space-y-1.5 text-xs text-ink-700 sm:text-sm">
                  <p className="font-semibold text-ink-900">Ketentuan Penting Tiket Masuk:</p>
                  <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
                    {data.ticketInfo.notes.map((note) => (
                      <li key={note} className="flex items-center gap-2 text-ink-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. CARD 2: SEKSI SOROTAN UTAMA & BINTANG TAMU                             */}
      {/* ========================================================================= */}
      {showHighlights && (
        <Card className="overflow-hidden border border-line/80 bg-card/95 shadow-soft">
          <CardContent className="space-y-6 p-5 sm:p-7">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-700">
                    EDITION HIGHLIGHTS & GUESTS
                  </span>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-ink-900 sm:text-2xl">
                    Seksi Sorotan Utama & Bintang Tamu
                  </h3>
                </div>
              </div>

              <Badge className="w-fit bg-stone-100 font-mono text-xs font-bold text-ink-700 ring-stone-300">
                {data.highlights.length} HIGHLIGHT RESMI
              </Badge>
            </div>

            {/* Highlights Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-white/70 p-4 transition hover:border-amber-300 hover:shadow-xs"
                >
                  <div>
                    <span className="inline-block rounded-full bg-stone-100 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-ink-700">
                      {item.tag}
                    </span>
                    <h4 className="mt-2.5 font-[var(--font-display)] text-base font-bold text-ink-900">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestone Footer */}
            {data.attendance.milestone && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                <Sparkles className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-xs font-medium text-ink-700 sm:text-sm">
                  <strong className="text-ink-900">Catatan Khusus Edisi:</strong> {data.attendance.milestone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. CARD 3: SEKSI PANDUAN AKSES TRANSPORTASI & SHUTTLE BUS GRATIS          */}
      {/* ========================================================================= */}
      {showTransport && (
        <Card className="overflow-hidden border border-line/80 bg-card/95 shadow-soft">
          <CardContent className="space-y-6 p-5 sm:p-7">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">
                    TRANSIT & FREE SHUTTLE BUS
                  </span>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-ink-900 sm:text-2xl">
                    Panduan Akses Transportasi Menuju ICE BSD
                  </h3>
                </div>
              </div>

              <Badge className="w-fit bg-emerald-500/10 font-mono text-xs font-bold text-emerald-800 ring-emerald-600/20">
                100% SHUTTLE GRATIS
              </Badge>
            </div>

            {/* Visual Transit Step-by-Step Flow */}
            <div className="rounded-2xl border border-line/80 bg-stone-50/70 p-4 sm:p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">
                DIAGRAM RUTE INTEGRASI TRANSIT KRL & SHUTTLE BUS
              </span>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {data.transportGuide.routeSteps.map((step, idx) => (
                  <div key={step.step} className="relative rounded-2xl border border-line bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-xs font-bold text-emerald-700">
                        0{step.step}
                      </span>
                      {step.badge && (
                        <Badge className="bg-stone-100 font-mono text-[10px] text-ink-700 ring-stone-300">
                          {step.badge}
                        </Badge>
                      )}
                    </div>

                    <h4 className="mt-3 font-[var(--font-display)] text-sm font-bold text-ink-900">
                      {step.title}
                    </h4>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-emerald-700">
                      {step.route}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-500">
                      {step.description}
                    </p>

                    {idx < data.transportGuide.routeSteps.length - 1 && (
                      <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-white p-1 text-ink-500 md:block z-10 shadow-xs">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Detail Transit Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Shuttle Bus Lorena */}
              <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-emerald-700" />
                    <span className="font-mono text-xs font-bold uppercase text-emerald-800">
                      {data.transportGuide.shuttleBus.name}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink-900">
                    {data.transportGuide.shuttleBus.route}
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-ink-700">
                    <p>
                      <strong>Jam:</strong> {data.transportGuide.shuttleBus.hours}
                    </p>
                    <p>
                      <strong>Frekuensi:</strong> {data.transportGuide.shuttleBus.frequency}
                    </p>
                    <p>
                      <strong>Tarif:</strong> <span className="font-semibold text-emerald-700">{data.transportGuide.shuttleBus.fare}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-ink-500">
                  {data.transportGuide.shuttleBus.note}
                </p>
              </div>

              {/* KRL Cisauk & Skywalk */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-white/70 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Train className="h-4 w-4 text-brand-600" />
                    <span className="font-mono text-xs font-bold uppercase text-ink-700">
                      KRL & SKYWALK CISAUK
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink-900">
                    Stasiun Cisauk (Lin Rangkasbitung)
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-ink-700">
                    <p>
                      <strong>Skywalk:</strong> {data.transportGuide.krlSkywalk.skywalkInfo}
                    </p>
                    <p>
                      <strong>BSD Link:</strong> {data.transportGuide.bsdLink.name} ({data.transportGuide.bsdLink.route})
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-ink-500">
                  {data.transportGuide.krlSkywalk.transitNote}
                </p>
              </div>

              {/* Tol & Parkir */}
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-white/70 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    <span className="font-mono text-xs font-bold uppercase text-ink-700">
                      KENDARAAN PRIBADI & PARKIR
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink-900">
                    Tol Serbaraja Exit BSD Barat
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-ink-700">
                    <p>
                      <strong>Akses Cepat:</strong> {data.transportGuide.tollAndVehicle.serbaraja}
                    </p>
                    <p>
                      <strong>Kapasitas:</strong> {data.transportGuide.tollAndVehicle.parkingCapacity}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-ink-500">
                  {data.transportGuide.tollAndVehicle.overflowParking}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 5. CARD 4: SEKSI REGULASI KOMUNITAS & COSPLAY                             */}
      {/* ========================================================================= */}
      {showRules && (
        <Card className="overflow-hidden border border-line/80 bg-card/95 shadow-soft">
          <CardContent className="space-y-6 p-5 sm:p-7">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-700">
                    COMMUNITY REGULATIONS & COSPLAY POLICY
                  </span>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-ink-900 sm:text-2xl">
                    Seksi Regulasi Komunitas & Kebijakan Cosplay
                  </h3>
                </div>
              </div>

              <Badge className="w-fit bg-rose-500/10 font-mono text-xs font-bold text-rose-800 ring-rose-600/20">
                TATA TERTIB RESMI
              </Badge>
            </div>

            {/* 4 Rules Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Anti Gen-AI */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-rose-800">
                    KEBIJAKAN KARYA VISUAL
                  </span>
                  <Badge className="bg-rose-500/10 text-rose-800 ring-rose-600/20">
                    DISKUALIFIKASI LANGSUNG
                  </Badge>
                </div>
                <h4 className="mt-2.5 font-[var(--font-display)] text-base font-bold text-ink-900">
                  {data.communityRules.antiGenAi.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-ink-700">
                  {data.communityRules.antiGenAi.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Sanksi: {data.communityRules.antiGenAi.sanction}</span>
                </div>
              </div>

              {/* No Bootleg */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-amber-800">
                    ORISINALITAS MEJA CIRCLE
                  </span>
                  <Badge className="bg-amber-500/10 text-amber-800 ring-amber-600/20">
                    FAN-MADE & ORISINAL
                  </Badge>
                </div>
                <h4 className="mt-2.5 font-[var(--font-display)] text-base font-bold text-ink-900">
                  {data.communityRules.noBootleg.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-ink-700">
                  {data.communityRules.noBootleg.description}
                </p>
                <p className="mt-3 text-xs text-ink-500">
                  {data.communityRules.copyrightAndPlagiarism.description}
                </p>
              </div>

              {/* Cosplay Props */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-blue-800">
                    PROPERTI SENJATA COSPLAY
                  </span>
                  <Badge className="bg-blue-500/10 text-blue-800 ring-blue-600/20">
                    INSPEKSI GERBANG
                  </Badge>
                </div>
                <h4 className="mt-2.5 font-[var(--font-display)] text-base font-bold text-ink-900">
                  {data.communityRules.cosplayProps.title}
                </h4>
                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-800">Bahan Diizinkan:</span>
                    <ul className="mt-1 list-disc pl-4 text-ink-700">
                      {data.communityRules.cosplayProps.allowedMaterials.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-rose-800">Dilarang Keras:</span>
                    <ul className="mt-1 list-disc pl-4 text-ink-700">
                      {data.communityRules.cosplayProps.prohibitedMaterials.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-ink-500">
                  {data.communityRules.cosplayProps.inspectionNote}
                </p>
              </div>

              {/* Cosplay Etiquette & Facilities */}
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-teal-800">
                    ETIKA & FASILITAS VENUE
                  </span>
                  <Badge className="bg-teal-500/10 text-teal-800 ring-teal-600/20">
                    COSPLAY IS NOT CONSENT
                  </Badge>
                </div>
                <h4 className="mt-2.5 font-[var(--font-display)] text-base font-bold text-ink-900">
                  {data.communityRules.cosplayEtiquette.title}
                </h4>
                <p className="mt-1.5 font-semibold text-xs text-teal-900">
                  {data.communityRules.cosplayEtiquette.consentPrinciple}
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="rounded-xl border border-line bg-white/80 p-2.5">
                    <span className="font-semibold text-ink-900">
                      {data.communityRules.facilities.changingRoom.title} ({data.communityRules.facilities.changingRoom.location}):
                    </span>
                    <p className="mt-0.5 text-ink-700">
                      {data.communityRules.facilities.changingRoom.fee} · {data.communityRules.facilities.changingRoom.rule}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-white/80 p-2.5">
                    <span className="font-semibold text-ink-900">
                      {data.communityRules.facilities.luggageStorage.title} ({data.communityRules.facilities.luggageStorage.location}):
                    </span>
                    <p className="mt-0.5 text-ink-700">
                      {data.communityRules.facilities.luggageStorage.rates}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-ink-500">
                  <strong>Zona Foto Resmi:</strong> {data.communityRules.cosplayEtiquette.photoZones}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
