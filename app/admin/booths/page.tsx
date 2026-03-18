export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteBoothAction, upsertBoothAction } from "@/actions/floor-maps";
import { AdminCardGrid } from "@/components/admin/admin-card-grid";
import { AdminCreatePanel } from "@/components/admin/admin-create-panel";
import { AdminCreateToggle, AdminCreateToggleButton, AdminCreateTogglePanel } from "@/components/admin/admin-create-toggle";
import { AdminField } from "@/components/admin/admin-field";
import { AdminSectionHeading } from "@/components/admin/admin-section-heading";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBooths, getCircleList, getEventList, getFloorMapsList } from "@/db/queries";
import { buildPathWithQuery, getSearchParam, truncateText, type SearchParams } from "@/lib/admin-ui";

export default async function AdminBoothsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const editId = getSearchParam(params, "edit");
  const [events, circles, maps, booths] = await Promise.all([
    getEventList(),
    getCircleList(),
    getFloorMapsList(),
    getBooths()
  ]);

  return (
    <AdminCreateToggle>
      <AdminShell
        title="Booth Locations"
        description="Hubungkan circle ke event dan floor map dengan booth code serta koordinat marker berbasis persentase x/y."
        headerActions={<AdminCreateToggleButton label="Add booth marker" />}
      >
      <AdminCreateTogglePanel
        title="Add booth marker"
        description="X dan Y memakai basis persentase terhadap image map, jadi 0 sampai 100 akan lebih mudah dipelihara lintas device."
      >
        <form action={upsertBoothAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminField label="Event" required>
            <Select name="eventId" required>
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Circle" required>
            <Select name="circleId" required>
              <option value="">Select circle</option>
              {circles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Floor map" required>
            <Select name="floorMapId" required>
              <option value="">Select floor map</option>
              {maps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Booth code" required>
            <Input name="boothCode" placeholder="A-12" required />
          </AdminField>
          <AdminField label="Marker X" required hint="0-100%">
            <Input type="number" name="posX" placeholder="28" required />
          </AdminField>
          <AdminField label="Marker Y" required hint="0-100%">
            <Input type="number" name="posY" placeholder="44" required />
          </AdminField>
          <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
            <Textarea name="notes" placeholder="Optional booth note" />
          </AdminField>
          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <SubmitButton>Save booth</SubmitButton>
          </div>
        </form>
      </AdminCreateTogglePanel>

      <section className="space-y-4">
        <AdminSectionHeading
          title="Booth marker list"
          description={`${booths.length} marker tersimpan. Grid ini menjaga daftar booth tetap mudah dipindai di desktop maupun mobile.`}
        />

        {booths.length ? (
          <AdminCardGrid>
            {booths.map((booth) => {
              const isEditing = editId === booth.id;

              return (
                <article key={booth.id} className="panel p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-[var(--font-display)] text-2xl font-semibold text-ink-900">{booth.boothCode}</h3>
                      <p className="mt-2 text-sm text-ink-500">{booth.circle.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary">
                        <Link href={isEditing ? "/admin/booths" : buildPathWithQuery("/admin/booths", { edit: booth.id })}>
                          {isEditing ? "Close" : "Edit"}
                        </Link>
                      </Button>
                      <form action={deleteBoothAction}>
                        <input type="hidden" name="id" value={booth.id} />
                        <ConfirmDeleteButton />
                      </form>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Event</p>
                      <p className="mt-2 font-medium text-ink-900">{booth.event.name}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Floor map</p>
                      <p className="mt-2 font-medium text-ink-900">{booth.floorMap.name}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Marker X / Y</p>
                      <p className="mt-2 font-medium text-ink-900">{booth.posX}% / {booth.posY}%</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Notes</p>
                      <p className="mt-2 text-sm text-ink-600">{truncateText(booth.notes, 120)}</p>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-5 border-t border-line/80 pt-5">
                      <form action={upsertBoothAction} className="grid gap-4 md:grid-cols-2">
                        <input type="hidden" name="id" value={booth.id} />
                        <AdminField label="Event" required>
                          <Select name="eventId" defaultValue={booth.eventId} required>
                            {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name}
                              </option>
                            ))}
                          </Select>
                        </AdminField>
                        <AdminField label="Circle" required>
                          <Select name="circleId" defaultValue={booth.circleId} required>
                            {circles.map((circle) => (
                              <option key={circle.id} value={circle.id}>
                                {circle.name}
                              </option>
                            ))}
                          </Select>
                        </AdminField>
                        <AdminField label="Floor map" required>
                          <Select name="floorMapId" defaultValue={booth.floorMapId} required>
                            {maps.map((map) => (
                              <option key={map.id} value={map.id}>
                                {map.name}
                              </option>
                            ))}
                          </Select>
                        </AdminField>
                        <AdminField label="Booth code" required>
                          <Input name="boothCode" defaultValue={booth.boothCode} required />
                        </AdminField>
                        <AdminField label="Marker X" required hint="0-100%">
                          <Input type="number" name="posX" defaultValue={booth.posX} required />
                        </AdminField>
                        <AdminField label="Marker Y" required hint="0-100%">
                          <Input type="number" name="posY" defaultValue={booth.posY} required />
                        </AdminField>
                        <AdminField label="Notes" className="md:col-span-2">
                          <Textarea name="notes" defaultValue={booth.notes ?? ""} />
                        </AdminField>
                        <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                          <Button asChild variant="secondary">
                            <Link href="/admin/booths">Cancel</Link>
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
          <EmptyState title="Belum ada marker booth" description="Tambahkan marker pertama untuk menghubungkan circle ke map event yang aktif." />
        )}
      </section>
    </AdminShell>
    </AdminCreateToggle>
  );
}