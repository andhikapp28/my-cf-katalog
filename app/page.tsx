export const revalidate = 120;

import Image from "next/image";
import Link from "next/link";
import { Banknote, Calendar, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { PreloadOfflineButton } from "@/components/dashboard/preload-offline-button";
import { getDashboardData } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { priorityStyles, statusStyles } from "@/lib/constants";

function getEventState(startsAt?: string | Date | null, isActive?: boolean) {
  if (isActive) {
    return "Active Event";
  }

  if (startsAt && new Date(startsAt).getTime() > Date.now()) {
    return "Upcoming Event";
  }

  return "Featured Event";
}

export default async function HomePage() {
  const dashboard = await getDashboardData();

  if (!dashboard) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada event" description="Tambahkan event pertama dari admin panel untuk mulai membangun katalog belanja." />
      </div>
    );
  }

  const eventState = getEventState(dashboard.selectedEvent.startsAt, dashboard.selectedEvent.isActive);

  return (
    <div className="container-shell space-y-8 py-8 md:py-10">
      <section className="panel overflow-hidden p-3 md:p-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[30px] border border-line/70 bg-ink-900 text-white">
            {dashboard.selectedEvent.bannerImageUrl ? (
              <>
                <Image
                  src={dashboard.selectedEvent.bannerImageUrl}
                  alt={dashboard.selectedEvent.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-brand-700/35" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),linear-gradient(135deg,#251c18_0%,#5b3525_48%,#d46a3a_100%)]" />
            )}

            <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
              <div className="space-y-4">
                <Badge className="border-white/20 bg-white/10 text-white ring-white/20">{eventState}</Badge>
                <div>
                  <h1 className="max-w-2xl font-[var(--font-display)] text-4xl font-semibold tracking-tight md:text-5xl">
                    {dashboard.selectedEvent.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
                    {dashboard.selectedEvent.description ||
                      "Kelola target item, booth circle, floor map, dan spending event dari satu dashboard yang ringan dipakai saat hari H."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/events/${dashboard.selectedEvent.slug}`} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-900">
                    Open event hub
                  </Link>
                  <Link href="/products" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white">
                    Browse products
                  </Link>
                  <PreloadOfflineButton
                    productIds={dashboard.products.map((p) => p.id)}
                    circleIds={dashboard.locations.map((l) => l.circleId)}
                  />
                </div>
                <div className="text-right text-sm text-white/80">
                  <p>{dashboard.selectedEvent.venue || "Venue belum diisi"}</p>
                  <p className="mt-1">{formatDate(dashboard.selectedEvent.startsAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-line/80 bg-white/85 p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Budget pulse</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{
                  width: `${Math.min(100, Math.round((dashboard.totalActual / Math.max(dashboard.selectedEvent.budget, 1)) * 100))}%`
                }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-ink-500">Budget</p>
                <p className="mt-1 font-semibold text-ink-900">{formatCurrency(dashboard.selectedEvent.budget)}</p>
              </div>
              <div>
                <p className="text-ink-500">Actual</p>
                <p className="mt-1 font-semibold text-ink-900">{formatCurrency(dashboard.totalActual)}</p>
              </div>
              <div>
                <p className="text-ink-500">Planned</p>
                <p className="mt-1 font-semibold text-ink-900">{formatCurrency(dashboard.totalEstimated)}</p>
              </div>
              <div>
                <p className="text-ink-500">Remaining</p>
                <p className={`mt-1 font-semibold ${dashboard.remainingBudget >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {formatCurrency(dashboard.remainingBudget)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-line bg-brand-50/60 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink-500">Event snapshot</p>
              <div className="mt-3 grid gap-3 text-sm text-ink-700">
                <div className="flex items-center justify-between gap-4">
                  <span>Total target item</span>
                  <span className="font-semibold text-ink-900">{dashboard.totalItems}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>High priority</span>
                  <span className="font-semibold text-ink-900">{dashboard.highPriorityItems.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>PO deadline aktif</span>
                  <span className="font-semibold text-ink-900">{dashboard.upcomingDeadlines.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comifuro Day-H Prep Section */}
      <section className="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Kesiapan Tunai ICE BSD</span>
            <Banknote className="h-4 w-4 text-amber-700" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-950">{formatCurrency(dashboard.cashNeeded)}</p>
          <p className="mt-1 text-xs text-amber-800/80">
            Estimasi cash on-the-spot. Sinyal ICE BSD rawan down & QRIS sering error!
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">⚡ Incaran Rush Pagi</span>
            <Zap className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-950">{dashboard.rushItems.length} Item</p>
          <p className="mt-1 text-xs text-rose-800/80">Barang fast sell-out yang wajib diserbu jam 10:00–11:00.</p>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">Target Day 1 (Sabtu)</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-950">{formatCurrency(dashboard.day1Estimated)}</p>
          <p className="mt-1 text-xs text-blue-800/80">Estimasi total belanja hunting Day 1.</p>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-800">Target Day 2 (Minggu)</span>
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-950">{formatCurrency(dashboard.day2Estimated)}</p>
          <p className="mt-1 text-xs text-purple-800/80">Estimasi total belanja hunting Day 2.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Target Items" value={`${dashboard.totalItems}`} helper="Total produk yang dipantau untuk event aktif." />
        <SummaryCard label="Estimated Spend" value={dashboard.totalEstimated} helper="Akumulasi target item x quantity." />
        <SummaryCard label="Actual Spend" value={dashboard.totalActual} helper="Akumulasi expense actual yang sudah tercatat." />
        <SummaryCard label="Budget Left" value={dashboard.remainingBudget} helper={dashboard.remainingBudget >= 0 ? "Masih aman terhadap budget." : "Sudah melewati budget event."} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-500">High Priority</p>
                <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">Top target items</h2>
              </div>
              <Link href="/products?priority=HIGH" className="text-sm font-medium text-brand-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {dashboard.highPriorityItems.length ? (
                dashboard.highPriorityItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-line bg-white/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={statusStyles[item.status]}>{item.status.replace("_", " ")}</Badge>
                      <Badge className={priorityStyles[item.priority]}>{item.priority}</Badge>
                    </div>
                    <Link href={`/products/${item.id}`} className="mt-3 block text-lg font-semibold text-ink-900 hover:text-brand-700">
                      {item.name}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                      <span>{item.circle.name}</span>
                      <span>{formatCurrency(item.price)}</span>
                      <span>{item.quantity} pcs</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-line px-4 py-6 text-sm text-ink-500">Belum ada item prioritas tinggi di event aktif.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-500">PO Deadlines</p>
                <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">Deadline terdekat</h2>
              </div>
              <div className="space-y-3 text-sm text-ink-700">
                {dashboard.upcomingDeadlines.length ? (
                  dashboard.upcomingDeadlines.map((item) => (
                    <Link key={item.id} href={`/products/${item.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3 hover:border-brand-300">
                      <div>
                        <p className="font-medium text-ink-900">{item.name}</p>
                        <p className="text-ink-500">{item.circle.name}</p>
                      </div>
                      <span>{formatDate(item.poDeadline)}</span>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-ink-500">Tidak ada deadline PO yang aktif.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Quick Links</p>
                <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">Priority circles</h2>
              </div>
              <div className="space-y-3">
                {dashboard.priorityCircles.length ? (
                  dashboard.priorityCircles.map((item) => (
                    <div key={item.circleId} className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="font-medium text-ink-900">{item.circleName}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink-500">
                        <span>Booth {item.boothCode}</span>
                        <Link href={`/products?circle=${item.circleId}`} className="text-brand-700">
                          View items
                        </Link>
                        {item.floorMapId ? (
                          <Link href={`/maps/${item.floorMapId}?circleId=${item.circleId}`} className="text-brand-700">
                            Open map
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Belum ada quick link circle prioritas.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-2rem)] max-w-xl rounded-full border border-line bg-white/95 px-5 py-3 shadow-soft backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Actual</p>
            <p className="font-semibold text-ink-900">{formatCurrency(dashboard.totalActual)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Budget Left</p>
            <p className={`font-semibold ${dashboard.remainingBudget >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatCurrency(dashboard.remainingBudget)}
            </p>
          </div>
          <Link href="/expenses" className="rounded-full bg-brand-500 px-4 py-2 font-medium text-white">
            Spend
          </Link>
        </div>
      </div>
    </div>
  );
}
