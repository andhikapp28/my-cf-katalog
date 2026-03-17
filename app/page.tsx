export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { getDashboardData } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { priorityStyles, statusStyles } from "@/lib/constants";

export default async function HomePage() {
  const dashboard = await getDashboardData();

  if (!dashboard) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada event" description="Tambahkan event pertama dari admin panel untuk mulai membangun katalog belanja." />
      </div>
    );
  }

  return (
    <div className="container-shell space-y-8 py-8 md:py-10">
      <section className="panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Active Event</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-ink-900 md:text-5xl">
              {dashboard.selectedEvent.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 md:text-base">{dashboard.selectedEvent.description || "Kelola target item, booth circle, floor map, dan spending event dari satu dashboard yang ringan dipakai saat hari H."}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/events/${dashboard.selectedEvent.slug}`} className="rounded-full bg-brand-500 px-5 py-3 text-sm font-medium text-white">
                Open event hub
              </Link>
              <Link href="/products" className="rounded-full border border-line px-5 py-3 text-sm font-medium text-ink-700">
                Browse products
              </Link>
            </div>
          </div>
          <div className="rounded-[28px] border border-line/80 bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Budget pulse</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{
                  width: `${Math.min(100, Math.round((dashboard.totalActual / Math.max(dashboard.selectedEvent.budget, 1)) * 100))}%`
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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
          </div>
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


