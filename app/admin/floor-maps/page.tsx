export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { deleteFloorMapAction, upsertFloorMapAction } from "@/actions/floor-maps";
import { AdminCardGrid } from "@/components/admin/admin-card-grid";
import { AdminCreatePanel } from "@/components/admin/admin-create-panel";
import { AdminField } from "@/components/admin/admin-field";
import { AdminSectionHeading } from "@/components/admin/admin-section-heading";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ImageFileInput } from "@/components/forms/image-file-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getEventList, getFloorMapsList } from "@/db/queries";
import { buildPathWithQuery, getSearchParam, type SearchParams } from "@/lib/admin-ui";

export default async function AdminFloorMapsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const editId = getSearchParam(params, "edit");
  const [events, maps] = await Promise.all([getEventList(), getFloorMapsList()]);

  return (
    <AdminShell
      title="Floor Maps"
      description="Upload denah event ke Vercel Blob dan simpan ukuran asli agar marker booth bisa ditempatkan konsisten."
    >
      <AdminCreatePanel
        title="Upload floor map"
        description="Gunakan panel ini untuk menambah floor map baru lengkap dengan ukuran kanvas aslinya."
      >
        <form action={upsertFloorMapAction} className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <AdminField label="Event" required className="xl:col-span-2">
            <Select name="eventId" required>
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Floor map name" required className="xl:col-span-2">
            <Input name="name" placeholder="Hall A Main Floor" required />
          </AdminField>
          <AdminField label="Width" required>
            <Input type="number" name="width" placeholder="1200" required />
          </AdminField>
          <AdminField label="Height" required>
            <Input type="number" name="height" placeholder="900" required />
          </AdminField>
          <div className="lg:col-span-2 xl:col-span-2">
            <ImageFileInput name="image" label="Map image" />
          </div>
          <div className="lg:col-span-2 xl:col-span-4 flex justify-end">
            <SubmitButton>Save floor map</SubmitButton>
          </div>
        </form>
      </AdminCreatePanel>

      <section className="space-y-4">
        <AdminSectionHeading
          title="Floor map library"
          description={`${maps.length} floor map tersimpan. Kartu tetap ringkas saat jumlah denah bertambah di event berikutnya.`}
        />

        {maps.length ? (
          <AdminCardGrid>
            {maps.map((map) => {
              const isEditing = editId === map.id;

              return (
                <article key={map.id} className="panel overflow-hidden p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-[var(--font-display)] text-2xl font-semibold text-ink-900">{map.name}</h3>
                      <p className="mt-2 text-sm text-ink-500">{map.event.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary">
                        <Link href={isEditing ? "/admin/floor-maps" : buildPathWithQuery("/admin/floor-maps", { edit: map.id })}>
                          {isEditing ? "Close" : "Edit"}
                        </Link>
                      </Button>
                      <form action={deleteFloorMapAction}>
                        <input type="hidden" name="id" value={map.id} />
                        <input type="hidden" name="imageUrl" value={map.imageUrl} />
                        <ConfirmDeleteButton />
                      </form>
                    </div>
                  </div>

                  <div className="mt-5 relative aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-brand-50">
                    <Image src={map.imageUrl} alt={map.name} fill className="object-cover" />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Event</p>
                      <p className="mt-2 font-medium text-ink-900">{map.event.name}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Size</p>
                      <p className="mt-2 font-medium text-ink-900">{map.width} x {map.height}</p>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-5 border-t border-line/80 pt-5">
                      <form action={upsertFloorMapAction} className="grid gap-4 md:grid-cols-2">
                        <input type="hidden" name="id" value={map.id} />
                        <input type="hidden" name="previousImageUrl" value={map.imageUrl} />
                        <AdminField label="Event" required>
                          <Select name="eventId" defaultValue={map.eventId} required>
                            {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name}
                              </option>
                            ))}
                          </Select>
                        </AdminField>
                        <AdminField label="Floor map name" required>
                          <Input name="name" defaultValue={map.name} required />
                        </AdminField>
                        <AdminField label="Width" required>
                          <Input type="number" name="width" defaultValue={map.width} required />
                        </AdminField>
                        <AdminField label="Height" required>
                          <Input type="number" name="height" defaultValue={map.height} required />
                        </AdminField>
                        <div className="md:col-span-2">
                          <ImageFileInput name="image" label="Replace map image" defaultUrl={map.imageUrl} />
                        </div>
                        <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                          <Button asChild variant="secondary">
                            <Link href="/admin/floor-maps">Cancel</Link>
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
          <EmptyState title="Belum ada floor map" description="Upload denah event pertama agar marker booth bisa ditempatkan di halaman map." />
        )}
      </section>
    </AdminShell>
  );
}