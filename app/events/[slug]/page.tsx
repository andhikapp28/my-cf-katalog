export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getDashboardData } from "@/db/queries";
import { Card, CardContent } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { formatCurrency, formatDate } from "@/lib/format";

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

  return (
    <div className="container-shell space-y-8 py-8">
      <section className="panel p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Event Hub</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">{event.name}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-500">
          <span>{event.venue || "Venue belum diisi"}</span>
          <span>{formatDate(event.startsAt)} - {formatDate(event.endsAt)}</span>
        </div>
        {event.description ? <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-600">{event.description}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Budget" value={event.budget} helper="Batas pengeluaran untuk event ini." />
        <SummaryCard label="Planned" value={dashboard.totalEstimated} helper="Total semua target item." />
        <SummaryCard label="Actual" value={dashboard.totalActual} helper="Total actual expense tercatat." />
        <SummaryCard label="Remaining" value={dashboard.remainingBudget} helper={dashboard.remainingBudget >= 0 ? "Masih di bawah budget." : "Sudah over budget."} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Priority items</h2>
            <div className="space-y-3">
              {dashboard.highPriorityItems.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm hover:border-brand-300">
                  <div>
                    <p className="font-medium text-ink-900">{item.name}</p>
                    <p className="text-ink-500">{item.circle.name}</p>
                  </div>
                  <span>{formatCurrency(item.price)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Quick access</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href={`/products?event=${event.id}`} className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 hover:border-brand-300">Open product catalog</Link>
              <Link href="/maps" className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 hover:border-brand-300">Check floor maps</Link>
              <Link href="/expenses" className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 hover:border-brand-300">Review expenses</Link>
              <Link href="/circles" className="rounded-3xl border border-line bg-white/70 px-5 py-5 text-sm font-medium text-ink-800 hover:border-brand-300">Browse circles</Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


