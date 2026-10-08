export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  Bus,
  Calendar,
  Clock,
  Layers,
  MapPin,
  Ticket
} from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getDashboardData } from "@/db/queries";
import { EventCompanionPlanner } from "@/components/events/event-companion-planner";
import { EventGuidesSection } from "@/components/events/event-guides-section";
import { getEventDetailDataWithFallback } from "@/lib/event-details-data";
import { formatDate } from "@/lib/format";

function getEditionBadge(slug: string, name: string) {
  const match = slug.match(/cf(\d+)/i) || name.match(/cf\s*(\d+)/i);
  if (match) {
    return `CF ${match[1]}`;
  }
  return "CF";
}

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug)
  });

  if (!event) {
    notFound();
  }

  const dashboard = await getDashboardData(event.id);

  if (!dashboard) {
    notFound();
  }

  const editionBadge = getEditionBadge(slug, event.name);
  const isUpcoming = new Date(event.startsAt ?? 0).getTime() > Date.now();
  const guideData = getEventDetailDataWithFallback(slug, event.name, event.venue);

  const statusBadgeConfig = event.isActive
    ? { label: "ACTIVE EVENT", className: "bg-[#D6F834] text-[#111215] font-black" }
    : isUpcoming
      ? { label: "COMING SOON", className: "bg-[#111215] text-white border border-white/20" }
      : { label: "PAST EVENT", className: "bg-[#111215]/85 text-white/90 border border-white/20" };

  const trackedCirclesCount = new Set(
    dashboard.products.map((item) => item.circleId)
  ).size;

  const plannerSummary = {
    totalEstimated: dashboard.totalEstimated,
    totalActual: dashboard.totalActual,
    remainingBudget: dashboard.remainingBudget,
    highPriorityItems: dashboard.highPriorityItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      status: item.status,
      priority: item.priority,
      circle: {
        id: item.circle.id,
        name: item.circle.name
      }
    })),
    upcomingDeadlines: dashboard.upcomingDeadlines.map((item) => ({
      id: item.id,
      name: item.name,
      poDeadline: item.poDeadline,
      circle: {
        id: item.circle.id,
        name: item.circle.name
      }
    })),
    priorityCircles: dashboard.priorityCircles,
    trackedItemsCount: dashboard.products.length,
    trackedCirclesCount
  };

  const wristbandCutoff =
    guideData.ticketInfo.wristbandExchangeHours.split("-")[1]?.trim() || "18:15 WIB";

  return (
    <div className="container-shell space-y-8 py-6 md:py-8">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-zinc-500">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 font-bold text-zinc-600 transition hover:text-[#111215]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Direktori Event</span>
        </Link>
        <span>/</span>
        <span className="font-bold text-zinc-900 uppercase">{editionBadge}</span>
      </nav>

      {/* 2. Hero Banner Event (Clean, Atmospheric & Punchy) */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-[#111215] text-white shadow-sm">
        {event.bannerImageUrl ? (
          <>
            <Image
              src={event.bannerImageUrl}
              alt={event.name}
              fill
              priority
              unoptimized
              className="object-cover object-center opacity-40 blur-[1px] transition-all duration-700 hover:opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-[#111215]/80 to-transparent" />
            <div className="absolute inset-0 bg-radial-[at_top_right] from-[#5398DA]/20 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#111215] via-[#181a20] to-[#252830]" />
        )}

        <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-10 lg:p-12 min-h-[340px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-black/80 px-3.5 py-1 font-mono text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-xs">
              {editionBadge}
            </span>
            <span
              className={`rounded-full px-3.5 py-1 font-mono text-[11px] backdrop-blur-md shadow-xs ${statusBadgeConfig.className}`}
            >
              {statusBadgeConfig.label}
            </span>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1 className="font-[var(--font-display)] text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-[0.98]">
              {event.name}
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium max-w-2xl">
              {event.description ||
                "Direktori katalog karya kreator independen, denah stan ICE BSD, dan perencana belanja acara."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-t border-white/15 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/products?eventId=${event.id}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#D6F834] px-6 py-2.5 font-mono text-xs font-black text-[#111215] transition hover:bg-[#cbf128] shadow-xs uppercase active:scale-[0.98]"
              >
                <span>JELAJAHI 1.400+ CIRCLE</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/maps"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 font-mono text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-[#111215] active:scale-[0.98]"
              >
                <span>BUKA PETA DENAH</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/80">
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
                <Calendar className="h-3.5 w-3.5 text-zinc-300" />
                <span>
                  {formatDate(event.startsAt)} - {formatDate(event.endsAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-zinc-300" />
                <span>{event.venue || "ICE BSD City"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Essential Quick Info Strip (Satu Baris Bersih & Terpadu - Zero Card Fatigue) */}
      <section className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 lg:grid-cols-4">
          <div className="flex items-center gap-3 px-2 sm:px-4">
            <Ticket className="h-5 w-5 text-[#F84632] shrink-0" />
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                TIKET MASUK
              </p>
              <p className="font-mono text-sm font-black text-zinc-900">
                {guideData.ticketInfo.regularPriceFormatted}
              </p>
              <p className="text-[11px] text-zinc-500">
                {guideData.ticketInfo.salesModel} ({guideData.ticketInfo.platform})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 sm:px-4 pt-3 sm:pt-0">
            <Clock className="h-5 w-5 text-zinc-700 shrink-0" />
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                JAM KUNJUNGAN
              </p>
              <p className="font-mono text-sm font-black text-zinc-900">
                08:00 - {guideData.ticketInfo.gateCloseHour}
              </p>
              <p className="text-[11px] text-zinc-500">
                Batas Tukar: {wristbandCutoff}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 sm:px-4 pt-3 sm:pt-0">
            <Bus className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                SHUTTLE BUS GRATIS
              </p>
              <p className="font-mono text-sm font-black text-zinc-900 truncate">
                Lorena (100% Gratis)
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                St. Cisauk ⇄ Hall 10 ICE BSD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 sm:px-4 pt-3 sm:pt-0">
            <Layers className="h-5 w-5 text-[#5398DA] shrink-0" />
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                AREA VENUE
              </p>
              <p className="font-mono text-sm font-black text-zinc-900 truncate">
                {guideData.attendance.venueHalls}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {guideData.attendance.estimatedCircles}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Feature: Tas Khilaf & Perencana Belanja (Directly Visible!) */}
      <EventCompanionPlanner
        eventId={event.id}
        eventBudget={event.budget}
        summary={plannerSummary}
      />

      {/* 5. Informasi Operasional & Regulasi Acara (Clean Reference Section) */}
      <EventGuidesSection data={guideData} />
    </div>
  );
}
