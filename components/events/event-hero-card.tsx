import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  Ticket,
  Users
} from "lucide-react";
import { EventActions } from "./event-actions";

export interface EventHeroCardProps {
  eventId: string;
  slug: string;
  name: string;
  bannerImageUrl?: string | null;
  isActive: boolean;
  isUpcoming: boolean;
  categoryLabel?: string;
  datesText: string;
  venueText: string;
  mapHref: string;
  circlesCountText: string;
  ticketPriceText: string;
  ticketPlatform: string;
  aboutText: string;
}

export function EventHeroCard({
  eventId,
  slug,
  name,
  bannerImageUrl,
  isActive,
  isUpcoming,
  categoryLabel = "Comic Market & Pop Culture",
  datesText,
  venueText,
  mapHref,
  circlesCountText,
  ticketPriceText,
  ticketPlatform,
  aboutText
}: EventHeroCardProps) {
  const statusBadge = isActive
    ? {
        label: "ACTIVE EVENT",
        className: "bg-[#D6F834] text-[#111215] border border-black/10"
      }
    : isUpcoming
      ? {
          label: "COMING SOON",
          className: "bg-white text-zinc-900 border border-zinc-200"
        }
      : {
          label: "PAST EVENT",
          className: "bg-zinc-800 text-zinc-200 border border-zinc-700"
        };

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs">
      {/* 1. 16:9 Banner Media Container with Floating Badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-950 shadow-inner">
        {bannerImageUrl ? (
          <>
            <Image
              src={bannerImageUrl}
              alt={name}
              fill
              priority
              unoptimized
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-950" />
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3 pointer-events-none">
          <span className="inline-flex items-center rounded-full bg-black/75 px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-wide text-white backdrop-blur-md border border-white/20 shadow-sm pointer-events-auto">
            {categoryLabel}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 font-mono text-[11px] font-black tracking-wider shadow-sm backdrop-blur-md pointer-events-auto ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* 2. Event Header Row: Title & Quick Actions */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-zinc-100 pb-6">
        <div className="space-y-1.5 max-w-3xl">
          <h1 className="font-[var(--font-display)] text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-zinc-900 leading-[1.02]">
            {name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Katalog karya mandiri, panduan kunjungan resmi, dan direktori stan kreator ICE BSD City.
          </p>
        </div>

        <EventActions
          eventId={eventId}
          eventSlug={slug}
          eventName={name}
          className="shrink-0 pt-1"
        />
      </div>

      {/* 3. Metadata Strip / Grid (4 Columns) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tanggal */}
        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 transition-colors hover:bg-zinc-50">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Calendar className="h-4 w-4 text-zinc-700" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Waktu Pelaksanaan
            </span>
          </div>
          <p className="font-mono text-sm sm:text-base font-black text-zinc-900">
            {datesText}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            08:00 - 18:30 WIB
          </p>
        </div>

        {/* Lokasi Venue */}
        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 transition-colors hover:bg-zinc-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <MapPin className="h-4 w-4 text-[#d46a3a]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Lokasi Venue
              </span>
            </div>
            <p className="font-mono text-sm sm:text-base font-black text-zinc-900">
              {venueText}
            </p>
          </div>
          <Link
            href={mapHref}
            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-zinc-800 hover:text-[#d46a3a] mt-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded"
          >
            <span>Buka Peta Event</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Circle Terdaftar */}
        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 transition-colors hover:bg-zinc-50">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Kreator Terdaftar
            </span>
          </div>
          <p className="font-mono text-sm sm:text-base font-black text-zinc-900">
            {circlesCountText}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Area Artist Alley &amp; Komunitas
          </p>
        </div>

        {/* Harga Tiket Masuk */}
        <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 transition-colors hover:bg-zinc-50">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Ticket className="h-4 w-4 text-indigo-600" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Tiket Masuk
            </span>
          </div>
          <p className="font-mono text-sm sm:text-base font-black text-zinc-900">
            {["Mulai", ticketPriceText].filter(Boolean).join(" ")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {`Platform: ${ticketPlatform}`}
          </p>
        </div>
      </div>

      {/* 4. "Tentang Acara" Section */}
      <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50/40 p-5 sm:p-6">
        <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-900 mb-2">
          Tentang Acara
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-zinc-700 font-normal">
          {aboutText}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/circles?eventId=${eventId}`}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 font-mono text-xs font-bold text-white transition hover:bg-zinc-800 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <span>Jelajahi Circle Kreator</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={mapHref}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold text-zinc-800 transition hover:bg-zinc-50 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <span>Denah Interaktif Hall</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
