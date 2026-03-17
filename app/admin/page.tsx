export const dynamic = "force-dynamic";

import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { getAdminOverviewCounts, getDashboardData } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [counts, dashboard] = await Promise.all([getAdminOverviewCounts(), getDashboardData()]);

  return (
    <AdminShell title="Admin Dashboard" description="Kelola event, booth, target item, image upload, dan expense dari satu workspace yang siap dipakai jangka panjang.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Events" value={`${counts.eventCount}`} helper="Total event tersimpan." />
        <SummaryCard label="Circles" value={`${counts.circleCount}`} helper="Directory circle global." />
        <SummaryCard label="Products" value={`${counts.productCount}`} helper="Seluruh target item lintas event." />
        <SummaryCard label="Expenses" value={`${counts.expenseCount}`} helper="Record planned dan actual spending." />
      </section>

      {dashboard ? (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Active Event Snapshot</p>
                  <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">{dashboard.selectedEvent.name}</h2>
                </div>
                <Link href="/admin/products" className="text-sm font-medium text-brand-700">
                  Manage products
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm"><p className="text-ink-500">Budget</p><p className="mt-1 font-semibold text-ink-900">{formatCurrency(dashboard.selectedEvent.budget)}</p></div>
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm"><p className="text-ink-500">Planned</p><p className="mt-1 font-semibold text-ink-900">{formatCurrency(dashboard.totalEstimated)}</p></div>
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm"><p className="text-ink-500">Actual</p><p className="mt-1 font-semibold text-ink-900">{formatCurrency(dashboard.totalActual)}</p></div>
              </div>
              <div className="space-y-3">
                {dashboard.upcomingDeadlines.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink-700">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-ink-900">{item.name}</p>
                        <p className="text-ink-500">{item.circle.name}</p>
                      </div>
                      <span>{formatDate(item.poDeadline)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Quick Admin Links</p>
              <div className="grid gap-3">
                <Link href="/admin/events" className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm font-medium text-ink-800 hover:border-brand-300">Manage events & budget</Link>
                <Link href="/admin/circles" className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm font-medium text-ink-800 hover:border-brand-300">Maintain circles directory</Link>
                <Link href="/admin/floor-maps" className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm font-medium text-ink-800 hover:border-brand-300">Upload floor maps</Link>
                <Link href="/admin/booths" className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm font-medium text-ink-800 hover:border-brand-300">Set booth coordinates</Link>
                <Link href="/admin/expenses" className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm font-medium text-ink-800 hover:border-brand-300">Track expenses</Link>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </AdminShell>
  );
}


