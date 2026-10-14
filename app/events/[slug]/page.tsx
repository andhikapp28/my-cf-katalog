export const revalidate = 120;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { EventHeroCard } from "@/components/events/event-hero-card";
import { EventTermsSection } from "@/components/events/event-terms-section";
import { EventHighlightsSection } from "@/components/events/event-highlights-section";
import { EventTicketsSidebar } from "@/components/events/event-tickets-sidebar";
import { EventBenefitsSidebar } from "@/components/events/event-benefits-sidebar";
import { EventMapPreviewCard } from "@/components/events/event-map-preview-card";
import { EventGuidesSection } from "@/components/events/event-guides-section";
import { getEventDetailDataWithFallback } from "@/lib/event-details-data";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug)
  });

  if (!event) {
    return {
      title: "Event Tidak Ditemukan · ComiPocket"
    };
  }

  return {
    title: `${event.name} · ComiPocket`,
    description:
      event.description ||
      `Detail tiket, tata tertib masuk, sorotan acara, dan panduan denah ${event.name} di ICE BSD City.`
  };
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

  const isCf23 = slug.toLowerCase() === "cf23" || slug.toLowerCase().includes("cf-23");
  const isUpcoming = new Date(event.startsAt ?? 0).getTime() > Date.now();
  const guideData = getEventDetailDataWithFallback(slug, event.name, event.venue);

  // Data konfigurasi tampilan Ventixe untuk CF 23 dan edisi lainnya
  const datesText = isCf23 ? "31 Okt - 1 Nov 2026" : guideData.datesText.replace(/–/g, "-");
  const venueText = isCf23
    ? "ICE BSD City (Hall 5, 6, 7, 8, 9, 10)"
    : (event.venue || guideData.venueFull.replace(/–/g, "-"));
  const circlesCountText = isCf23 ? "1.959 Circle Terdaftar" : guideData.attendance.estimatedCircles;
  const ticketPriceText = guideData.ticketInfo.regularPriceFormatted;
  const ticketPlatform = guideData.ticketInfo.platform || "Ticket2U";
  const mapHref = `/events/${slug}/map`;

  const aboutText = isCf23
    ? "Comic Frontier 23 hadir di ICE BSD City dengan perayaan tematik Halloween Weekend. Menghadirkan 1.959 circle kreator terkurasi di area Artist Alley, instalasi pameran komunitas mandiri di Hall 5, dan pasar komik independen terbesar di Indonesia."
    : (event.description ||
      guideData.attendance.milestone ||
      "Direktori katalog karya kreator independen, denah stan ICE BSD City, dan perencana belanja acara.");

  const breadcrumbName = isCf23
    ? "Comic Frontier 23"
    : (event.name.includes(" (") ? event.name.split(" (")[0] : event.name);

  return (
    <div className="container-shell space-y-8 py-6 md:py-10">
      {/* 1. Breadcrumb Navigation (Ventixe Layout: Dashboard / Events / Comic Frontier 23) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Link
          href="/"
          className="transition hover:text-zinc-900 font-medium"
        >
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-400" />
        <Link
          href="/events"
          className="transition hover:text-zinc-900 font-medium"
        >
          Events
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-400" />
        <span className="font-bold text-zinc-900 truncate max-w-[240px] sm:max-w-none">
          {breadcrumbName}
        </span>
      </nav>

      {/* 2. Hero Card Container (16:9 Banner, Floating Badges, Title, Actions, Metadata Strip, & About) */}
      <EventHeroCard
        eventId={event.id}
        slug={slug}
        name={event.name}
        bannerImageUrl={event.bannerImageUrl || (isCf23 ? "/banner/cf23.jpg" : undefined)}
        isActive={event.isActive}
        isUpcoming={isUpcoming}
        categoryLabel="Comic Market & Pop Culture"
        datesText={datesText}
        venueText={venueText}
        mapHref={mapHref}
        circlesCountText={circlesCountText}
        ticketPriceText={ticketPriceText}
        ticketPlatform={ticketPlatform}
        aboutText={aboutText}
      />

      {/* 3. Asymmetric 2-Column Grid (65% Left, 35% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri (~65% / 8 Kolom Desktop): Tata Tertib & Ketentuan Masuk + Program Khusus & Tamu */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Tata Tertib & Ketentuan Masuk */}
          <EventTermsSection />

          {/* Section 2: Program Khusus & Bintang Tamu */}
          <EventHighlightsSection />
        </div>

        {/* Kolom Kanan (~35% / 4 Kolom Desktop): Tiket Resmi + Benefit Pengunjung + Denah & Peta */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Widget 1: Paket Tiket Resmi */}
          <EventTicketsSidebar
            platform={ticketPlatform}
            ticketUrl="https://www.ticket2u.id"
          />

          {/* Widget 2: Benefit & Fasilitas Pengunjung */}
          <EventBenefitsSidebar />

          {/* Widget 3: Akses Denah & Peta Event */}
          <EventMapPreviewCard
            mapHref={mapHref}
            hallsText={isCf23 ? "Hall 5, 6, 7, 8, 9, 10" : guideData.attendance.venueHalls.replace(/–/g, "-")}
          />
        </aside>
      </div>

      {/* 4. Seksi Operasional Tambahan (Opsional: Transportasi Lengkap & Rute Detail) */}
      <section className="pt-6 border-t border-zinc-200">
        <details className="group rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs transition-all">
          <summary className="flex cursor-pointer items-center justify-between font-mono text-sm sm:text-base font-bold text-zinc-900 list-none select-none">
            <div className="space-y-0.5">
              <span className="block font-[var(--font-display)] text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900">
                Panduan Operasional &amp; Transportasi Lengkap
              </span>
              <span className="block text-xs font-normal text-zinc-500 font-sans">
                Akses rute KRL Skywalk Cisauk, Shuttle Bus Lorena, Tol Serbaraja, dan jadwal gate.
              </span>
            </div>
            <span className="rounded-xl border border-zinc-200 px-3 py-1 font-mono text-xs font-bold text-zinc-700 group-open:bg-zinc-900 group-open:text-white group-open:border-zinc-900 transition-colors">
              Lihat Detail
            </span>
          </summary>

          <div className="mt-6 pt-6 border-t border-zinc-100">
            <EventGuidesSection data={guideData} />
          </div>
        </details>
      </section>
    </div>
  );
}
