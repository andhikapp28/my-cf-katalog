export const revalidate = 120;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  Building2,
  Bus,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Ghost,
  Package,
  Sparkles,
  Users
} from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { EventHeroCard } from "@/components/events/event-hero-card";
import {
  EventTermsSection,
  DEFAULT_TERMS,
  type TermRuleItem
} from "@/components/events/event-terms-section";
import {
  EventHighlightsSection,
  type HighlightCardData
} from "@/components/events/event-highlights-section";
import {
  EventTicketsSidebar,
  type TicketPackageItem
} from "@/components/events/event-tickets-sidebar";
import {
  EventBenefitsSidebar,
  type BenefitFacilityItem
} from "@/components/events/event-benefits-sidebar";
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

  // 1. Program khusus & sorotan faktual per edisi
  const highlightsList: HighlightCardData[] = guideData.highlights.map((h) => {
    let icon = Sparkles;
    const tagUpper = h.tag.toUpperCase();
    if (tagUpper.includes("COMMUTER") || tagUpper.includes("KAI") || tagUpper.includes("TRANSPORT")) {
      icon = CreditCard;
    } else if (tagUpper.includes("COSPLAY") || tagUpper.includes("HALLOWEEN") || tagUpper.includes("PARADE")) {
      icon = Ghost;
    } else if (tagUpper.includes("MERCH") || tagUpper.includes("GOODS") || tagUpper.includes("CULINARY")) {
      icon = Package;
    } else if (
      tagUpper.includes("COMMUNITY") ||
      tagUpper.includes("STAGE") ||
      tagUpper.includes("HOLOLIVE") ||
      tagUpper.includes("CREATOR") ||
      tagUpper.includes("MARKET")
    ) {
      icon = Users;
    }

    return {
      category: h.tag,
      title: h.title,
      description: h.description,
      icon
    };
  });

  // 2. Tata tertib dinamis menyesuaikan data gate edisi
  const eventTerms: TermRuleItem[] = [
    {
      number: "01",
      title: "Tiket Masuk & Identitas",
      icon: FileCheck2,
      summary: `Penukaran wristband resmi dan verifikasi identitas pengunjung ${breadcrumbName}.`,
      rules: [
        `Penukaran e-voucher wristband di gate venue mulai pukul ${guideData.ticketInfo.wristbandExchangeHours || "08:00 - 18:15 WIB"}.`,
        "Wajib menunjukkan kartu identitas resmi (KTP, kartu pelajar, atau paspor) yang sesuai dengan akun pemesan tiket.",
        `Pintu masuk hall ditutup pukul ${guideData.ticketInfo.gateCloseHour || "18:30 WIB"}; ${guideData.ticketInfo.childPolicy || "anak berusia 2 tahun ke atas wajib tiket"}.`
      ]
    },
    ...DEFAULT_TERMS.slice(1)
  ];

  // 3. Paket tiket resmi / arsip harga edisi
  const ticketPackages: TicketPackageItem[] = [
    {
      id: "single-day",
      name: "Single Day Pass",
      priceFormatted: guideData.ticketInfo.regularPriceFormatted || "Rp 75.000",
      description: `Akses 1 hari pameran (${guideData.ticketInfo.salesModel || "100% online"}).`,
      benefits: [
        `Akses Artist Alley & stan circle di ${guideData.attendance.venueHalls}`,
        "Layanan gratis Shuttle Bus Lorena PP (St. Cisauk - ICE BSD)",
        "Akses pameran karya komunitas kreatif"
      ]
    },
    {
      id: "bundle-goods",
      name: "Bundle Official Goods",
      priceFormatted: guideData.ticketInfo.bundlePriceFormatted || "Rp 130.000",
      badge: "Edisi Terbatas",
      description: `Akses 1 hari pameran ditambah merchandise resmi edisi ${breadcrumbName}.`,
      benefits: [
        `Tiket masuk 1 hari pameran ${breadcrumbName}`,
        "Wristband kolektor resmi edisi khusus",
        "Paket merchandise dan katalog kurasi resmi"
      ]
    }
  ];

  // 4. Benefit fasilitas disesuaikan dengan venue & kapasitas edisi
  const benefitsList: BenefitFacilityItem[] = [
    {
      icon: Bus,
      title: "Shuttle Bus Gratis Lorena",
      badge: "100% Gratis",
      description: "Rute PP St. Cisauk (Terminal Intermoda) ke Hall 10 ICE BSD, armada bus AC beroperasi 07:00 - 21:30 WIB."
    },
    {
      icon: Users,
      title: "Area Kreator & Komunitas",
      badge: "Kreator Alley",
      description: `Eksplorasi karya mandiri ribuan circle terkurasi di area ${guideData.attendance.venueHalls}.`
    },
    {
      icon: Building2,
      title: "Venue Ber-AC & Fasilitas Lengkap",
      badge: "Fasilitas Resmi",
      description: "Kenyamanan pendingin udara penuh di seluruh hall, bilik ruang ganti cosplayer terpisah, pos medis darurat, dan mushola."
    }
  ];

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
          <EventTermsSection terms={eventTerms} />

          {/* Section 2: Program Khusus & Bintang Tamu */}
          <EventHighlightsSection highlights={highlightsList} eventName={breadcrumbName} />
        </div>

        {/* Kolom Kanan (~35% / 4 Kolom Desktop): Tiket Resmi + Benefit Pengunjung + Denah & Peta */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Widget 1: Paket Tiket Resmi */}
          <EventTicketsSidebar
            packages={ticketPackages}
            platform={ticketPlatform}
            ticketUrl="https://www.ticket2u.id"
            isPastEvent={!isUpcoming && !event.isActive}
          />

          {/* Widget 2: Benefit & Fasilitas Pengunjung */}
          <EventBenefitsSidebar benefits={benefitsList} />

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
