export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { getEventList, getExpenseSummary } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ExpensesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const eventId = typeof params.event === "string" ? params.event : undefined;
  const [events, summary] = await Promise.all([getEventList(), getExpenseSummary(eventId)]);

  if (!summary) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada data expense" description="Masukkan budget event dan expense records dari admin panel untuk melihat ringkasan spending." />
      </div>
    );
  }

  return (
    <div className="container-shell space-y-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Expenses</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Budget & spending tracker</h1>
      </div>

      <form className="panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-ink-500">Ringkasan event</p>
          <h2 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">{summary.event.name}</h2>
        </div>
        <div className="flex gap-3">
          <Select name="event" defaultValue={eventId}>
            <option value="">Active event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
          <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">
            Apply
          </button>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent><p className="text-xs uppercase tracking-[0.24em] text-ink-500">Budget</p><p className="mt-3 text-2xl font-semibold">{formatCurrency(summary.totalBudget)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs uppercase tracking-[0.24em] text-ink-500">Planned</p><p className="mt-3 text-2xl font-semibold">{formatCurrency(summary.totalPlanned)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs uppercase tracking-[0.24em] text-ink-500">Actual</p><p className="mt-3 text-2xl font-semibold">{formatCurrency(summary.totalActual)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs uppercase tracking-[0.24em] text-ink-500">Difference</p><p className={`mt-3 text-2xl font-semibold ${summary.difference >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(summary.difference)}</p></CardContent></Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Category breakdown</h2>
            <div className="space-y-3">
              {summary.categoryBreakdown.map((item) => (
                <div key={item.categoryId} className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-ink-900">{item.categoryName}</span>
                    <span className="text-ink-700">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Recent records</h2>
            <div className="space-y-3">
              {summary.records.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-900">{item.product?.name || item.category.name}</p>
                      <p className="mt-1 text-ink-500">{formatDate(item.expenseDate)} â€¢ {item.paymentMethod}</p>
                      {item.note ? <p className="mt-2 text-ink-600">{item.note}</p> : null}
                    </div>
                    <p className="font-semibold text-ink-900">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


