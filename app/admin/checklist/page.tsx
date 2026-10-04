export const dynamic = "force-dynamic";

import Link from "next/link";
import { Zap } from "lucide-react";
import { ChecklistItemCard } from "@/components/checklist/checklist-item-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getChecklistData, getEventList } from "@/db/queries";
import { buildPathWithQuery, getSearchParam, type SearchParams } from "@/lib/admin-ui";
import {
  checklistStatuses,
  filterChecklistItemsByDay,
  filterChecklistItemsByStatus,
  type ChecklistDayFilter,
  type ChecklistStatusFilter
} from "@/lib/checklist";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const filterOptions: { value: ChecklistStatusFilter; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "TARGET", label: "Target" },
  { value: "PO_OPEN", label: "PO Open" },
  { value: "PO_DONE", label: "PO Done" }
];

const dayOptions: { value: ChecklistDayFilter; label: string; icon?: boolean }[] = [
  { value: "ALL", label: "Semua Hari" },
  { value: "DAY_1", label: "Day 1 (Sabtu)" },
  { value: "DAY_2", label: "Day 2 (Minggu)" },
  { value: "RUSH_ONLY", label: "Incaran Rush", icon: true }
];

function isValidStatusFilter(value: string | undefined): value is ChecklistStatusFilter {
  return value === "ALL" || (checklistStatuses as readonly string[]).includes(value ?? "");
}

function isValidDayFilter(value: string | undefined): value is ChecklistDayFilter {
  return value === "ALL" || value === "DAY_1" || value === "DAY_2" || value === "RUSH_ONLY";
}

export default async function ChecklistPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const eventId = getSearchParam(params, "event");
  const statusParam = getSearchParam(params, "status");
  const dayParam = getSearchParam(params, "day");
  const statusFilter: ChecklistStatusFilter = isValidStatusFilter(statusParam) ? statusParam : "ALL";
  const dayFilter: ChecklistDayFilter = isValidDayFilter(dayParam) ? dayParam : "ALL";

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

  const dayCounts = {
    ALL: data.items.length,
    DAY_1: data.items.filter((item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === "DAY_1").length,
    DAY_2: data.items.filter((item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === "DAY_2").length,
    RUSH_ONLY: data.items.filter((item) => item.isRush).length
  };

  const statusFiltered = filterChecklistItemsByStatus(data.items, statusFilter);
  const filteredItems = filterChecklistItemsByDay(statusFiltered, dayFilter);

  const counts = {
    ALL: data.items.length,
    TARGET: data.items.filter((item) => item.status === "TARGET").length,
    PO_OPEN: data.items.filter((item) => item.status === "PO_OPEN").length,
    PO_DONE: data.items.filter((item) => item.status === "PO_DONE").length
  };

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

      <section className="panel space-y-3 p-4">
        {/* Day / Rush Filter Tabs */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Jadwal Hunting Comifuro</p>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map((option) => (
              <Link
                key={option.value}
                href={buildPathWithQuery("/admin/checklist", {
                  event: data.event.id,
                  status: statusFilter === "ALL" ? undefined : statusFilter,
                  day: option.value === "ALL" ? undefined : option.value
                })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                  dayFilter === option.value
                    ? option.value === "RUSH_ONLY"
                      ? "border-rose-600 bg-rose-600 text-white"
                      : "border-ink-900 bg-ink-900 text-white"
                    : option.value === "RUSH_ONLY"
                      ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "border-line bg-white/80 text-ink-700 hover:bg-brand-50"
                )}
              >
                {option.icon ? <Zap className="h-3 w-3 fill-current" /> : null}
                <span>{option.label}</span>
                <span className="opacity-80">· {dayCounts[option.value]}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="pt-2 border-t border-line/60">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Status Belanja</p>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Link
                key={option.value}
                href={buildPathWithQuery("/admin/checklist", {
                  event: data.event.id,
                  day: dayFilter === "ALL" ? undefined : dayFilter,
                  status: option.value === "ALL" ? undefined : option.value
                })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                  statusFilter === option.value
                    ? "border-brand-500 bg-brand-500 text-white font-semibold"
                    : "border-line bg-white/80 text-ink-700 hover:bg-brand-50"
                )}
              >
                {option.label} · {counts[option.value]}
              </Link>
            ))}
          </div>
        </div>

        <p className="pt-2 text-xs text-ink-500">
          Menampilkan <span className="font-semibold text-ink-900">{filteredItems.length}</span> item · estimasi total <span className="font-semibold text-ink-900">{formatCurrency(totalEstimated)}</span>
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
          description="Semua item pada filter ini sudah diselesaikan, atau belum ada target item untuk jadwal ini."
        />
      )}
    </AdminShell>
  );
}
