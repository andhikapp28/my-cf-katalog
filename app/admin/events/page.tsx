export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { deleteEventAction, upsertEventAction } from "@/actions/events";
import { AdminCardGrid } from "@/components/admin/admin-card-grid";
import { AdminCreatePanel } from "@/components/admin/admin-create-panel";
import { AdminCreateToggle, AdminCreateToggleButton, AdminCreateTogglePanel } from "@/components/admin/admin-create-toggle";
import { AdminField } from "@/components/admin/admin-field";
import { AdminSectionHeading } from "@/components/admin/admin-section-heading";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getEventList } from "@/db/queries";
import { buildPathWithQuery, getSearchParam, toDateTimeLocalValue, truncateText, type SearchParams } from "@/lib/admin-ui";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminEventsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const editId = getSearchParam(params, "edit");
  const events = await getEventList();

  return (
    <AdminCreateToggle>
      <AdminShell
        title="Events"
        description="Simpan semua event Comifuro, atur budget, tandai event aktif, dan pasang banner visual untuk dashboard utama."
        headerActions={<AdminCreateToggleButton label="Add event" />}
      >
      <AdminCreateTogglePanel
        title="Create event"
        description="Form utama untuk menambah event baru, menentukan budget, dan memilih event aktif yang muncul di dashboard."
      >
        <form action={upsertEventAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminField label="Event name" required>
            <Input name="name" placeholder="Comifuro 23" required />
          </AdminField>
          <AdminField label="Slug" required>
            <Input name="slug" placeholder="comifuro-23" required />
          </AdminField>
          <AdminField label="Venue">
            <Input name="venue" placeholder="ICE BSD City" />
          </AdminField>
          <AdminField label="Banner image URL" className="md:col-span-2 xl:col-span-3">
            <Input name="bannerImageUrl" placeholder="https://example.com/banner.jpg" />
          </AdminField>
          <AdminField label="Start date">
            <Input type="datetime-local" name="startsAt" />
          </AdminField>
          <AdminField label="End date">
            <Input type="datetime-local" name="endsAt" />
          </AdminField>
          <AdminField label="Budget" required>
            <Input type="number" name="budget" placeholder="1500000" required />
          </AdminField>
          <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
            <Textarea name="description" placeholder="Catatan event, target hall, atau agenda belanja utama." />
          </AdminField>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink-700 md:col-span-2 xl:col-span-3">
            <input type="checkbox" name="isActive" className="h-4 w-4" />
            Active event
          </label>
          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <SubmitButton>Create event</SubmitButton>
          </div>
        </form>
      </AdminCreateTogglePanel>

      <section className="space-y-4">
        <AdminSectionHeading
          title="Event library"
          description={`${events.length} event tersimpan. Gunakan kartu ringkas ini untuk scan cepat lalu buka edit hanya saat diperlukan.`}
        />

        {events.length ? (
          <AdminCardGrid>
            {events.map((event) => {
              const isEditing = editId === event.id;

              return (
                <article key={event.id} className="panel overflow-hidden p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-[var(--font-display)] text-2xl font-semibold text-ink-900">{event.name}</h3>
                        <Badge className={event.isActive ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-stone-100 text-stone-700 ring-stone-200"}>
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-ink-500">
                        {event.startsAt ? formatDate(event.startsAt) : "Date not set"}
                        {event.endsAt ? ` - ${formatDate(event.endsAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary">
                        <Link href={isEditing ? "/admin/events" : buildPathWithQuery("/admin/events", { edit: event.id })}>
                          {isEditing ? "Close" : "Edit"}
                        </Link>
                      </Button>
                      <form action={deleteEventAction}>
                        <input type="hidden" name="id" value={event.id} />
                        <ConfirmDeleteButton />
                      </form>
                    </div>
                  </div>

                  {event.bannerImageUrl ? (
                    <div className="relative mt-5 aspect-[2.6/1] overflow-hidden rounded-3xl border border-line bg-brand-50">
                      <Image src={event.bannerImageUrl} alt={event.name} fill className="object-cover" />
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Venue</p>
                      <p className="mt-2 font-medium text-ink-900">{event.venue || "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Budget</p>
                      <p className="mt-2 font-medium text-ink-900">{formatCurrency(event.budget)}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-ink-600">{truncateText(event.description, 180)}</p>

                  {isEditing ? (
                    <div className="mt-5 border-t border-line/80 pt-5">
                      <form action={upsertEventAction} className="grid gap-4 md:grid-cols-2">
                        <input type="hidden" name="id" value={event.id} />
                        <AdminField label="Event name" required>
                          <Input name="name" defaultValue={event.name} required />
                        </AdminField>
                        <AdminField label="Slug" required>
                          <Input name="slug" defaultValue={event.slug} required />
                        </AdminField>
                        <AdminField label="Venue">
                          <Input name="venue" defaultValue={event.venue ?? ""} />
                        </AdminField>
                        <AdminField label="Budget" required>
                          <Input type="number" name="budget" defaultValue={event.budget} required />
                        </AdminField>
                        <AdminField label="Start date">
                          <Input type="datetime-local" name="startsAt" defaultValue={toDateTimeLocalValue(event.startsAt)} />
                        </AdminField>
                        <AdminField label="End date">
                          <Input type="datetime-local" name="endsAt" defaultValue={toDateTimeLocalValue(event.endsAt)} />
                        </AdminField>
                        <AdminField label="Banner image URL" className="md:col-span-2">
                          <Input name="bannerImageUrl" defaultValue={event.bannerImageUrl ?? ""} placeholder="https://example.com/banner.jpg" />
                        </AdminField>
                        <AdminField label="Notes" className="md:col-span-2">
                          <Textarea name="description" defaultValue={event.description ?? ""} />
                        </AdminField>
                        <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink-700 md:col-span-2">
                          <input type="checkbox" name="isActive" defaultChecked={event.isActive} className="h-4 w-4" />
                          Active event
                        </label>
                        <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                          <Button asChild variant="secondary">
                            <Link href="/admin/events">Cancel</Link>
                          </Button>
                          <SubmitButton>Save changes</SubmitButton>
                        </div>
                      </form>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </AdminCardGrid>
        ) : (
          <EmptyState title="Belum ada event" description="Buat event pertama untuk mulai mengelompokkan produk, map, booth, dan expense." />
        )}
      </section>
    </AdminShell>
    </AdminCreateToggle>
  );
}