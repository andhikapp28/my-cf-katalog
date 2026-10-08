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
  Layers,
  ShieldAlert,
  Sparkles,
  Ticket,
  Train
} from "lucide-react";
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

  const wristbandCutoff =
    data.ticketInfo.wristbandExchangeHours.split("-")[1]?.trim() || "18:15 WIB";

  return (
    <section id="event-guides" className="space-y-6 pt-6">
      {/* 1. Header & Tab Navigation */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
            INFORMASI OPERASIONAL &amp; REGULASI RESMI
          </p>
          <h2 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
            Panduan Lengkap &amp; Regulasi {data.editionName}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Informasi tiket masuk, rute shuttle bus gratis Lorena, dan tata tertib resmi di venue ICE BSD City.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Kategori Panduan Event"
          className="flex items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100 p-1 shadow-2xs scrollbar-none sm:shrink-0"
        >
          {GUIDE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-mono font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
                  isActive
                    ? "bg-[#111215] text-white shadow-xs"
                    : "text-zinc-600 hover:bg-white hover:text-zinc-900"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#D6F834]" : "text-zinc-400")} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Seksi Tiket & Waktu Akses Gate */}
      {showTickets && (
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                <Ticket className="h-5 w-5 text-zinc-800" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  OFFICIAL TICKETING &amp; GATE ACCESS
                </span>
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase text-zinc-900">
                  Seksi Tiket &amp; Waktu Akses Gate
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>{data.datesText}</span>
              <span>·</span>
              <span className="font-bold text-zinc-800">{data.ticketInfo.salesModel}</span>
            </div>
          </div>

          {/* 4 Summary Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                PLATFORM RESMI
              </p>
              <p className="mt-1 font-[var(--font-display)] text-lg font-black text-zinc-900">
                {data.ticketInfo.platform}
              </p>
              <p className="text-[11px] text-zinc-500">{data.ticketInfo.salesModel}</p>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                TIKET REGULER
              </p>
              <p className="mt-1 font-mono text-base font-black text-zinc-900">
                {data.ticketInfo.regularPriceFormatted}
              </p>
              <p className="text-[11px] text-zinc-500">Akses 1 hari per pengunjung</p>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                TIKET BUNDLE MERCH
              </p>
              <p className="mt-1 font-mono text-base font-black text-zinc-900">
                {data.ticketInfo.bundlePriceFormatted || "Tidak Tersedia"}
              </p>
              <p className="text-[11px] text-zinc-500">Paket official merchandise</p>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                ESTIMASI PENGUNJUNG
              </p>
              <p className="mt-1 font-mono text-base font-black text-zinc-900">
                {data.attendance.estimatedAttendees}
              </p>
              <p className="text-[11px] text-zinc-500">{data.attendance.venueHalls}</p>
            </div>
          </div>

          {/* Clean Gate Schedule Line */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-600" />
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-800">
                Jadwal Operasional Gerbang &amp; Penukaran Wristband
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-600">Mulai Penukaran</span>
                  <span className="font-mono text-xs font-black text-zinc-900">08:00 WIB</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Loket penukaran e-voucher barcode dibuka di lobi Hall 10.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-600">Batas Penukaran</span>
                  <span className="font-mono text-xs font-black text-zinc-900">{wristbandCutoff}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Batas akhir scan dan penukaran tiket fisik ditutup.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-600">Pintu Masuk Ditutup</span>
                  <span className="font-mono text-xs font-black text-zinc-900">{data.ticketInfo.gateCloseHour}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Pintu masuk hall ditutup total untuk seluruh pengunjung.
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Ketentuan Penting Tiket Masuk:
            </p>
            <ul className="grid gap-2 text-xs text-zinc-700 sm:grid-cols-2">
              {data.ticketInfo.notes.map((note) => (
                <li key={note} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-zinc-900" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      )}

      {/* 3. Seksi Sorotan Utama & Bintang Tamu */}
      {showHighlights && (
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  EDITION HIGHLIGHTS &amp; GUESTS
                </span>
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase text-zinc-900">
                  Seksi Sorotan Utama &amp; Bintang Tamu
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-zinc-500">
              {data.highlights.length} Program Unggulan
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2 hover:bg-white hover:border-zinc-900 transition-colors"
              >
                <span className="inline-block rounded-md bg-zinc-200/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-700">
                  {item.tag}
                </span>
                <h4 className="font-[var(--font-display)] text-base font-bold text-zinc-900 uppercase">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {data.attendance.milestone && (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-700">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
              <p>
                <strong className="text-zinc-900 font-semibold">Catatan Khusus Edisi:</strong>{" "}
                {data.attendance.milestone}
              </p>
            </div>
          )}
        </article>
      )}

      {/* 4. Panduan Akses Transportasi Menuju ICE BSD */}
      {showTransport && (
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                <Bus className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  TRANSIT &amp; FREE SHUTTLE BUS
                </span>
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase text-zinc-900">
                  Panduan Akses Transportasi Menuju ICE BSD
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700">
              Shuttle Bus Gratis Lorena Tersedia
            </span>
          </div>

          {/* 3 Step Diagram */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-800">
              Diagram Rute Integrasi Transit KRL &amp; Shuttle Bus
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              {data.transportGuide.routeSteps.map((step, idx) => (
                <div key={step.step} className="relative rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111215] font-mono text-xs font-black text-[#D6F834]">
                      0{step.step}
                    </span>
                    {step.badge && (
                      <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2.5 font-[var(--font-display)] text-sm font-bold text-zinc-900">
                    {step.title}
                  </h4>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-emerald-700">
                    {step.route}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                    {step.description}
                  </p>

                  {idx < data.transportGuide.routeSteps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-1 text-zinc-400 md:block z-10 shadow-xs">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3 Columns Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-emerald-700" />
                <span className="font-mono text-xs font-bold uppercase text-emerald-900">
                  {data.transportGuide.shuttleBus.name}
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-900">
                {data.transportGuide.shuttleBus.route}
              </h4>
              <div className="space-y-1 text-xs text-zinc-700">
                <p>
                  <strong>Jam:</strong> {data.transportGuide.shuttleBus.hours}
                </p>
                <p>
                  <strong>Frekuensi:</strong> {data.transportGuide.shuttleBus.frequency}
                </p>
                <p>
                  <strong>Tarif:</strong>{" "}
                  <span className="font-semibold text-emerald-700">
                    {data.transportGuide.shuttleBus.fare}
                  </span>
                </p>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1 border-t border-emerald-100">
                {data.transportGuide.shuttleBus.note}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Train className="h-4 w-4 text-[#5398DA]" />
                <span className="font-mono text-xs font-bold uppercase text-zinc-700">
                  KRL &amp; SKYWALK CISAUK
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-900">
                Stasiun Cisauk (Lin Rangkasbitung)
              </h4>
              <div className="space-y-1 text-xs text-zinc-700">
                <p>
                  <strong>Skywalk:</strong> {data.transportGuide.krlSkywalk.skywalkInfo}
                </p>
                <p>
                  <strong>BSD Link:</strong> {data.transportGuide.bsdLink.name} ({data.transportGuide.bsdLink.route})
                </p>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                {data.transportGuide.krlSkywalk.transitNote}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-zinc-700" />
                <span className="font-mono text-xs font-bold uppercase text-zinc-700">
                  KENDARAAN PRIBADI &amp; PARKIR
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-900">
                Tol Serbaraja Exit BSD Barat
              </h4>
              <div className="space-y-1 text-xs text-zinc-700">
                <p>
                  <strong>Akses Cepat:</strong> {data.transportGuide.tollAndVehicle.serbaraja}
                </p>
                <p>
                  <strong>Kapasitas:</strong> {data.transportGuide.tollAndVehicle.parkingCapacity}
                </p>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                {data.transportGuide.tollAndVehicle.overflowParking}
              </p>
            </div>
          </div>
        </article>
      )}

      {/* 5. Seksi Regulasi Komunitas & Kebijakan Cosplay */}
      {showRules && (
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                <ShieldAlert className="h-5 w-5 text-zinc-800" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  COMMUNITY REGULATIONS &amp; COSPLAY POLICY
                </span>
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase text-zinc-900">
                  Seksi Regulasi Komunitas &amp; Kebijakan Cosplay
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-zinc-500">
              Tata Tertib Resmi
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-zinc-700">
                  KEBIJAKAN KARYA VISUAL
                </span>
                <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  DISKUALIFIKASI LANGSUNG
                </span>
              </div>
              <h4 className="font-[var(--font-display)] text-base font-bold text-zinc-900 uppercase">
                {data.communityRules.antiGenAi.title}
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {data.communityRules.antiGenAi.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold pt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Sanksi: {data.communityRules.antiGenAi.sanction}</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-zinc-700">
                  ORISINALITAS MEJA CIRCLE
                </span>
                <span className="font-mono text-[10px] font-bold text-zinc-700 bg-zinc-200/60 px-2 py-0.5 rounded">
                  FAN-MADE &amp; ORISINAL
                </span>
              </div>
              <h4 className="font-[var(--font-display)] text-base font-bold text-zinc-900 uppercase">
                {data.communityRules.noBootleg.title}
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {data.communityRules.noBootleg.description}
              </p>
              <p className="text-xs text-zinc-500">
                {data.communityRules.copyrightAndPlagiarism.description}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-zinc-700">
                  PROPERTI SENJATA COSPLAY
                </span>
                <span className="font-mono text-[10px] font-bold text-zinc-700 bg-zinc-200/60 px-2 py-0.5 rounded">
                  INSPEKSI GERBANG
                </span>
              </div>
              <h4 className="font-[var(--font-display)] text-base font-bold text-zinc-900 uppercase">
                {data.communityRules.cosplayProps.title}
              </h4>
              <div className="space-y-1.5 text-xs text-zinc-700">
                <p>
                  <strong className="text-zinc-900">Bahan Diizinkan:</strong>{" "}
                  {data.communityRules.cosplayProps.allowedMaterials.join(", ")}
                </p>
                <p>
                  <strong className="text-rose-700">Dilarang Keras:</strong>{" "}
                  {data.communityRules.cosplayProps.prohibitedMaterials.join(", ")}
                </p>
              </div>
              <p className="text-[11px] text-zinc-500">
                {data.communityRules.cosplayProps.inspectionNote}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-zinc-700">
                  ETIKA &amp; FASILITAS VENUE
                </span>
                <span className="font-mono text-[10px] font-bold text-zinc-700 bg-zinc-200/60 px-2 py-0.5 rounded">
                  ETIKA RESMI
                </span>
              </div>
              <h4 className="font-[var(--font-display)] text-base font-bold text-zinc-900 uppercase">
                {data.communityRules.cosplayEtiquette.title}
              </h4>
              <p className="text-xs font-semibold text-zinc-800">
                {data.communityRules.cosplayEtiquette.consentPrinciple}
              </p>
              <div className="space-y-1 text-xs text-zinc-600">
                <p>
                  <strong>Ruang Ganti:</strong> {data.communityRules.facilities.changingRoom.fee} ({data.communityRules.facilities.changingRoom.location})
                </p>
                <p>
                  <strong>Penitipan Barang:</strong> {data.communityRules.facilities.luggageStorage.rates} ({data.communityRules.facilities.luggageStorage.location})
                </p>
                <p>
                  <strong>Zona Foto:</strong> {data.communityRules.cosplayEtiquette.photoZones}
                </p>
              </div>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
