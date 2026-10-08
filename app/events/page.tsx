export const revalidate = 120;

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Layers,
  MapPin,
  Users2
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BannerBadgeMotion,
  BannerCardMotion
} from "@/components/landing/landing-motion";
import { getEventsWithCounts } from "@/db/queries";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function getEditionBadge(slug: string, name: string) {
  const match = slug.match(/cf(\d+)/i) || name.match(/CF\s*(\d+)/i) || name.match(/Frontier\s*(\d+)/i);
  if (match) {
    return `CF ${match[1]}`;
  }
  return slug.toUpperCase();
}

function getEditionNumber(slug: string, name: string) {
  const match = slug.match(/cf(\d+)/i) || name.match(/CF\s*(\d+)/i) || name.match(/Frontier\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

function formatEventDate(startsAt?: string | Date | null, endsAt?: string | Date | null) {
  if (!startsAt) return "-";
  const start = new Date(startsAt);
  if (!endsAt) return formatDate(startsAt);
  const end = new Date(endsAt);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const monthYear = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(end);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startDay} - ${endDay} ${monthYear}`;
  }
  return `${formatDate(startsAt)} - ${formatDate(endsAt)}`;
}

export default async function EventsPage() {
  const events = await getEventsWithCounts();

  if (!events.length) {
    return (
      <div className="container-shell py-12">
        <EmptyState
          title="Belum ada event terdaftar"
          description="Tambahkan atau sinkronkan data event Comifuro untuk mulai mengelola target belanja dan direktori."
        />
      </div>
    );
  }

  const now = Date.now();
  const upcomingEvents = events
    .filter((event) => {
      const startsAt = event.startsAt ? new Date(event.startsAt).getTime() : Number.POSITIVE_INFINITY;
      return event.isActive || startsAt >= now;
    })
    .sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });

  const pastEvents = events
    .filter((event) => {
      const startsAt = event.startsAt ? new Date(event.startsAt).getTime() : Number.NEGATIVE_INFINITY;
      return !event.isActive && startsAt < now;
    })
    .sort((a, b) => {
      const aNum = getEditionNumber(a.slug, a.name);
      const bNum = getEditionNumber(b.slug, b.name);
      if (aNum !== bNum) return bNum - aNum;
      const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Number.NEGATIVE_INFINITY;
      const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Number.NEGATIVE_INFINITY;
      return bTime - aTime;
    });

  return (
    <div className="container-shell max-w-7xl mx-auto space-y-12 py-10 md:py-14">
      <header className="relative overflow-hidden rounded-3xl bg-[#5398DA] text-white p-7 sm:p-10 lg:p-12 shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#D6F834]/20 blur-[100px]" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase backdrop-blur-md border border-white/20">
              <span>CURATED ARCHIVES · ICE BSD CITY</span>
            </div>
            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-[0.98]">
              DIREKTORI &amp; ARSIP <span className="text-[#D6F834]">COMIC FRONTIER</span>
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium max-w-xl">
              Arsip komprehensif perhelatan Comic Frontier lintas edisi mulai dari CF 16 hingga CF 23 di ICE BSD City. Akses direktori kreator independen, katalog karya, dan rekam jejak komunitas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/circles"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-bold font-mono text-white backdrop-blur-md transition hover:bg-white hover:text-[#111215] shadow-xs"
            >
              <span>LIHAT SEMUA CIRCLE</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D6F834] px-5 py-2.5 text-xs font-black font-mono text-[#111215] transition hover:bg-[#cbf128] shadow-sm uppercase"
            >
              <span>BUKA KATALOG KARYA</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>
      {upcomingEvents.length ? (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-zinc-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>EDISI UTAMA &amp; MENDATANG</span>
              </div>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl font-black uppercase text-[#111215] tracking-tight">
                UPCOMING &amp; ACTIVE CONVENTIONS
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              Event yang sedang berlangsung atau segera hadir di ICE BSD City. Siapkan wishlist dan rencana kunjunganmu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}
      {pastEvents.length ? (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-zinc-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                <Layers className="h-3.5 w-3.5 text-zinc-400" />
                <span>ARSIP EDISI TERDAHULU (CF 16 - CF 21)</span>
              </div>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl font-black uppercase text-[#111215] tracking-tight">
                PAST COMIFURO ARCHIVES
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              Rekam jejak edisi Comic Frontier sebelumnya untuk referensi katalog, denah booth, dan sejarah komunitas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isArchived />
            ))}
          </div>
        </section>
      ) : null}
      <div className="relative overflow-hidden rounded-3xl bg-[#111215] text-white p-7 sm:p-9 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#D6F834]">
              PILIH FANDOM CEPAT
            </span>
            <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              POPULAR COMIFURO FANDOMS
            </h3>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#D6F834] transition hover:text-white"
          >
            <span>Buka Filter Lengkap</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2.5 text-xs font-mono font-semibold">
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
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/90 transition hover:border-[#D6F834] hover:bg-[#D6F834] hover:text-[#111215] shadow-2xs"
            >
              {fandom}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  isArchived = false
}: {
  event: Awaited<ReturnType<typeof getEventsWithCounts>>[number];
  isArchived?: boolean;
}) {
  const editionBadge = getEditionBadge(event.slug, event.name);
  const dateFormatted = formatEventDate(event.startsAt, event.endsAt);
  const isUpcoming = new Date(event.startsAt ?? 0).getTime() >= Date.now();

  // Status badge colors: active (Acid Lime), coming soon (Deep Black), past event (translucent).
  const statusConfig = event.isActive
    ? { label: "ACTIVE EVENT", className: "bg-[#D6F834] text-[#111215] font-black shadow-xs" }
    : isUpcoming
      ? { label: "COMING SOON", className: "bg-[#111215] text-white border border-white/20 shadow-xs" }
      : { label: "PAST EVENT", className: "bg-[#111215]/80 text-white/90 border border-white/20 shadow-xs" };

  const circleCountNumber = Number(event.circleCount || 0);
  const productCountNumber = Number(event.productCount || 0);
  const hasData = circleCountNumber > 0 || productCountNumber > 0;
  const primaryHref = event.isActive ? "/products" : `/events/${event.slug}`;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition duration-300 hover:border-[#111215] hover:shadow-xl hover:shadow-black/5 h-full">
      <BannerCardMotion
        imageSrc={event.bannerImageUrl}
        imageAlt={event.name}
        badge={
          <span className="rounded-lg bg-black/75 px-3 py-1 font-mono text-xs font-black text-white backdrop-blur-md border border-white/20 shadow-md">
            {editionBadge}
          </span>
        }
        className="aspect-[16/9] rounded-t-2xl rounded-b-none border-0"
      >
        <div className="absolute top-3 right-3 z-20">
          <BannerBadgeMotion>
            <span
              className={cn(
                "rounded-full px-3 py-0.5 text-[11px] font-mono font-bold backdrop-blur-md shadow-md",
                statusConfig.className
              )}
            >
              {statusConfig.label}
            </span>
          </BannerBadgeMotion>
        </div>
      </BannerCardMotion>
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-5">
        <div className="space-y-3">
          {hasData || !isArchived ? (
            <Link href={primaryHref} className="block group-hover:text-[#111215] transition-colors">
              <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 group-hover:text-[#111215] transition-colors leading-snug">
                {event.name}
              </h3>
            </Link>
          ) : (
            <Link href={`/events/${event.slug}`} className="block group-hover:text-[#111215] transition-colors">
              <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 group-hover:text-[#111215] transition-colors leading-snug">
                {event.name}
              </h3>
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
              <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{dateFormatted}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{event.venue || "ICE BSD City"}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {event.description ||
              "Direktori katalog karya dan rekam jejak Comic Frontier di ICE BSD City."}
          </p>
          <div className="pt-1">
            {circleCountNumber > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-mono">
                <Users2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  JUMLAH CIRCLE:
                </span>
                <span className="font-bold text-zinc-900">
                  {circleCountNumber.toLocaleString("id-ID")} Circle
                </span>
              </div>
            ) : isUpcoming ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50 px-3.5 py-1.5 text-xs font-mono text-zinc-600">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5398DA]" />
                <span className="text-[11px] font-semibold">1.500+ Circle (Tahap Kurasi)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50 px-3 py-1.5 text-xs font-mono text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-[11px] font-medium">Dokumentasi Edisi Resmi</span>
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono min-h-[48px]">
          {event.isActive ? (
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#111215] px-4 py-2 text-xs font-bold font-mono text-white transition hover:bg-[#D6F834] hover:text-[#111215] shadow-xs"
              >
                <span>CARI 1.400+ CIRCLE</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:border-[#111215] hover:text-[#111215]"
              >
                <span>Detail Event</span>
              </Link>
            </div>
          ) : isUpcoming ? (
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-xs font-bold font-mono text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-2xs"
            >
              <span>LIHAT DETAIL EVENT</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : isArchived && hasData ? (
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-xs font-bold font-mono text-[#111215] transition hover:bg-[#111215] hover:text-white shadow-2xs"
            >
              <span>LIHAT ARSIP EVENT</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-500 hover:text-[#111215] transition-colors"
            >
              <span>Buka Arsip &amp; Panduan</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}

          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider ml-auto">
            {editionBadge}
          </span>
        </div>
      </div>
    </article>
  );
}
