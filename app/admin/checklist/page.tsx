export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChecklistItemCard } from "@/components/checklist/checklist-item-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getChecklistData, getEventList } from "@/db/queries";
import { buildPathWithQuery, getSearchParam, type SearchParams } from "@/lib/admin-ui";
import { checklistStatuses, filterChecklistItemsByStatus, type ChecklistStatusFilter } from "@/lib/checklist";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const filterOptions: { value: ChecklistStatusFilter; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "TARGET", label: "Target" },
  { value: "PO_OPEN", label: "PO Open" },
  { value: "PO_DONE", label: "PO Done" }
];

function isValidStatusFilter(value: string | undefined): value is ChecklistStatusFilter {
  return value === "ALL" || (checklistStatuses as readonly string[]).includes(value ?? "");
}

export default async function ChecklistPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const eventId = getSearchParam(params, "event");
  const statusParam = getSearchParam(params, "status");
  const statusFilter: ChecklistStatusFilter = isValidStatusFilter(statusParam) ? statusParam : "ALL";

  const [events, data] = await Promise.all([getEventList(), getChecklistData(eventId)]);

  if (!data) {
    return (
      <AdminShell
        title="Checklist Mode"
        description="Mode ringan untuk dipakai sambil jalan di venue: tap sekali untuk update status item."
      >
        <EmptyState
          title="Belum ada event"
          description="Tambahkan event terlebih dahulu di menu Events sebelum memakai mode checklist."
        />
      </AdminShell>
    );
  }

  const counts = {
    ALL: data.items.length,
    TARGET: data.items.filter((item) => item.status === "TARGET").length,
    PO_OPEN: data.items.filter((item) => item.status === "PO_OPEN").length,
    PO_DONE: data.items.filter((item) => item.status === "PO_DONE").length
  };

  const filteredItems = filterChecklistItemsByStatus(data.items, statusFilter);
  const totalEstimated = filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AdminShell
      title="Checklist Mode"
      description={`${data.event.name} · tap sekali untuk update status item saat sudah dibeli, tanpa reload halaman.`}
    >
      {events.length > 1 ? (
        <section className="panel flex flex-wrap gap-2 p-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={buildPathWithQuery("/admin/checklist", { event: event.id })}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                event.id === data.event.id
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-line bg-white/80 text-ink-700 hover:bg-brand-50"
              )}
            >
              {event.name}
            </Link>
          ))}
        </section>
      ) : null}

      <section className="panel p-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Link
              key={option.value}
              href={buildPathWithQuery("/admin/checklist", {
                event: data.event.id,
                status: option.value === "ALL" ? undefined : option.value
              })}
              className={cn(
                "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                statusFilter === option.value
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-line bg-white/80 text-ink-700 hover:bg-brand-50"
              )}
            >
              {option.label} · {counts[option.value]}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-500">
          {filteredItems.length} item · estimasi total {formatCurrency(totalEstimated)}
        </p>
      </section>

      {filteredItems.length ? (
        <section className="space-y-3">
          {filteredItems.map((item) => (
            <ChecklistItemCard key={item.id} product={item} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="Tidak ada item"
          description="Semua item pada filter ini sudah diselesaikan, atau belum ada target item untuk event ini."
        />
      )}
    </AdminShell>
  );
}
