export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getDashboardData } from "@/db/queries";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { priorityStyles, statusStyles } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

function getEventState(startsAt?: string | Date | null, isActive?: boolean) {
  if (isActive) {
    return "Active Event";
  }

  if (startsAt && new Date(startsAt).getTime() > Date.now()) {
    return "Upcoming Event";
  }

  return "Archived Event";
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await db.query.events.findFirst({ where: eq(events.slug, slug) });

  if (!event) {
    notFound();
  }

  const dashboard = await getDashboardData(event.id);

  if (!dashboard) {
    notFound();
  }

  const eventState = getEventState(event.startsAt, event.isActive);
  const budgetUsage = Math.min(100, Math.round((dashboard.totalActual / Math.max(event.budget, 1)) * 100));
  const trackedCircles = new Set(dashboard.products.map((item) => item.circleId)).size;

  return (
    <div className="container-shell space-y-8 py-8 md:py-10">
      <section className="panel overflow-hidden p-3 md:p-4">
        <div className="relative overflow-hidden rounded-[34px] border border-line/70 bg-ink-900 text-white">
          {event.bannerImageUrl ? (
            <>
              <Image src={event.bannerImageUrl} alt={event.name} fill priority className="object-cover object-center" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,14,12,0.84)_0%,rgba(19,14,12,0.72)_34%,rgba(19,14,12,0.38)_62%,rgba(19,14,12,0.18)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,106,58,0.22),transparent_34%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),linear-gradient(115deg,#211815_0%,#563528_44%,#d46a3a_100%)]" />
          )}

          <div className="relative grid min-h-[248px] gap-5 p-5 sm:min-h-[280px] sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.72fr)] lg:items-end">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-white/20 bg-white/10 text-white ring-white/20">{eventState}</Badge>
                  {event.isActive ? <Badge className="bg-emerald-200/90 text-emerald-900">ACTIVE</Badge> : null}
                </div>
                <div>
                  <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.85rem]">
                    {event.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                    {event.description ||
                      "Semua target item, booth circle, floor map, dan pengeluaran event ini dirangkum dalam satu hub yang cepat dibuka saat persiapan maupun hari H."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <Link href={`/products?eventId=${event.id}`} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-900 transition hover:bg-brand-50">
                    Browse products
                  </Link>
                  <Link
                    href="/maps"
                    className="rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/14"
                  >
                    Open floor maps
                  </Link>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-white/82">
                  <div className="rounded-full border border-white/14 bg-black/18 px-4 py-2 backdrop-blur-sm">
                    {event.venue || "Venue belum diisi"}
                  </div>
                  <div className="rounded-full border border-white/14 bg-black/18 px-4 py-2 backdrop-blur-sm">
                    {formatDate(event.startsAt)} - {formatDate(event.endsAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col justify-end">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[24px] border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/62">Budget</p>
                  <p className="mt-2 text-base font-semibold text-white">{formatCurrency(event.budget)}</p>
                </div>
                <div className="rounded-[24px] border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/62">Planned</p>
                  <p className="mt-2 text-base font-semibold text-white">{formatCurrency(dashboard.totalEstimated)}</p>
                </div>
                <div className="rounded-[24px] border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/62">Remaining</p>
                      <p className="mt-2 text-base font-semibold text-white">{formatCurrency(dashboard.remainingBudget)}</p>
                    </div>
                    <span className="rounded-full border border-white/12 bg-black/16 px-2.5 py-1 text-[11px] font-medium text-white/78">
                      {budgetUsage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Budget" value={event.budget} helper="Batas pengeluaran untuk event ini." />
        <SummaryCard label="Planned" value={dashboard.totalEstimated} helper="Total semua target item x quantity." />
        <SummaryCard label="Actual" value={dashboard.totalActual} helper="Total actual expense yang sudah tercatat." />
        <SummaryCard
          label="Remaining"
          value={dashboard.remainingBudget}
          helper={dashboard.remainingBudget >= 0 ? "Masih aman terhadap budget." : "Perlu rem pengeluaran tambahan."}
        />
        <SummaryCard label="Tracked Circles" value={String(trackedCircles)} helper="Jumlah circle yang sedang dipantau di event ini." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-semibold">Priority items</h2>
                <p className="mt-1 text-sm text-ink-500">Item prioritas tinggi yang paling relevan untuk dibuka cepat saat persiapan event.</p>
              </div>
              <Link href={`/products?eventId=${event.id}&priority=HIGH`} className="text-sm font-medium text-brand-700 hover:text-brand-800">
                View all
              </Link>
            </div>

            {dashboard.highPriorityItems.length ? (
              <div className="space-y-3">
                {dashboard.highPriorityItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-white/70 px-4 py-4 transition hover:border-brand-300"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusStyles[item.status]}>{formatStatusLabel(item.status)}</Badge>
                        <Badge className={priorityStyles[item.priority]}>{item.priority}</Badge>
                      </div>
                      <p className="mt-3 font-medium text-ink-900">{item.name}</p>
                      <p className="mt-1 text-sm text-ink-500">{item.circle.name}</p>
                    </div>
                    <span className="shrink-0 font-semibold text-ink-900">{formatCurrency(item.price)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="Belum ada item prioritas tinggi" description="Tambahkan priority HIGH pada target item penting agar mudah dipantau di event hub." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-semibold">PO deadlines</h2>
                <p className="mt-1 text-sm text-ink-500">Deadline preorder terdekat supaya keputusan belanja tidak kelewatan.</p>
              </div>
              <Link href={`/products?eventId=${event.id}`} className="text-sm font-medium text-brand-700 hover:text-brand-800">
                Browse catalog
              </Link>
            </div>

            {dashboard.upcomingDeadlines.length ? (
              <div className="space-y-3">
                {dashboard.upcomingDeadlines.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/70 px-4 py-4 transition hover:border-brand-300"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900">{item.name}</p>
                      <p className="mt-1 text-sm text-ink-500">{item.circle.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-ink-900">{formatDate(item.poDeadline)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-500">Deadline</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="Tidak ada deadline aktif" description="Belum ada produk dengan deadline PO yang perlu dipantau untuk event ini." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Circle quick links</h2>
            <p className="text-sm text-ink-500">Circle prioritas dari target item penting, lengkap dengan booth code jika sudah ditentukan.</p>
            {dashboard.priorityCircles.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {dashboard.priorityCircles.map((item) => (
                  <div key={item.circleId} className="rounded-3xl border border-line bg-white/70 px-5 py-5">
                    <p className="font-medium text-ink-900">{item.circleName}</p>
                    <p className="mt-1 text-sm text-ink-500">Booth {item.boothCode}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/circles/${item.circleId}`} className="rounded-full border border-line px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700">
                        Open circle
                      </Link>
                      {item.floorMapId ? (
                        <Link href={`/maps/${item.floorMapId}`} className="rounded-full border border-line px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700">
                          View map
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Belum ada quick links circle" description="Isi target item prioritas tinggi dan booth location agar shortcut circle muncul di halaman ini." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Quick access</h2>
            <p className="text-sm text-ink-500">Shortcut paling sering dipakai saat buka event hub dari HP maupun desktop.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href={`/products?eventId=${event.id}`} className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 transition hover:border-brand-300 hover:text-brand-700">
                Open product catalog
              </Link>
              <Link href="/maps" className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 transition hover:border-brand-300 hover:text-brand-700">
                Check floor maps
              </Link>
              <Link href="/expenses" className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 transition hover:border-brand-300 hover:text-brand-700">
                Review expenses
              </Link>
              <Link href="/circles" className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 transition hover:border-brand-300 hover:text-brand-700">
                Browse circles
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
