export const dynamic = "force-dynamic";

import Link from "next/link";
import { EventCardBanner } from "@/components/events/event-card-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getEventsWithCounts } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function EventsPage() {
  const events = await getEventsWithCounts();

  if (!events.length) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada event" description="Tambahkan event dari admin panel untuk mulai mengelola target Comifuro." />
      </div>
    );
  }

  return (
    <div className="container-shell space-y-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Events</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Semua event Comifuro</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className="space-y-5">
              <EventCardBanner src={event.bannerImageUrl} alt={event.name} />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-[var(--font-display)] text-2xl font-semibold text-ink-900 transition hover:text-brand-700"
                  >
                    {event.name}
                  </Link>
                  <p className="mt-2 text-sm text-ink-500">Mulai {formatDate(event.startsAt)}</p>
                </div>
                {event.isActive ? <Badge className="shrink-0 bg-emerald-100 text-emerald-800">ACTIVE</Badge> : null}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-ink-700">
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                  <p className="text-ink-500">Budget</p>
                  <p className="mt-1 font-medium">{formatCurrency(event.budget)}</p>
                </div>
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                  <p className="text-ink-500">Products</p>
                  <p className="mt-1 font-medium">{event.productCount}</p>
                </div>
              </div>

              <Link
                href={`/events/${event.slug}`}
                className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                Open event
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
