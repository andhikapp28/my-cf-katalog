export const dynamic = "force-dynamic";

import { deleteBoothAction, upsertBoothAction } from "@/actions/floor-maps";
import { AdminShell } from "@/components/layout/admin-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBooths, getCircleList, getEventList, getFloorMapsList } from "@/db/queries";

export default async function AdminBoothsPage() {
  const [events, circles, maps, booths] = await Promise.all([getEventList(), getCircleList(), getFloorMapsList(), getBooths()]);

  return (
    <AdminShell title="Booth Locations" description="Hubungkan circle ke event dan floor map dengan booth code serta koordinat marker berbasis persentase x/y.">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel p-5">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">Add booth marker</h2>
          <form action={upsertBoothAction} className="mt-5 space-y-4">
            <Select name="eventId" required><option value="">Select event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</Select>
            <Select name="circleId" required><option value="">Select circle</option>{circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}</Select>
            <Select name="floorMapId" required><option value="">Select floor map</option>{maps.map((map) => <option key={map.id} value={map.id}>{map.name}</option>)}</Select>
            <Input name="boothCode" placeholder="A-12" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="number" name="posX" placeholder="28" required />
              <Input type="number" name="posY" placeholder="44" required />
            </div>
            <Textarea name="notes" placeholder="Optional booth note" />
            <SubmitButton>Save booth</SubmitButton>
          </form>
        </section>

        <section className="space-y-4">
          {booths.map((booth) => (
            <div key={booth.id} className="panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-semibold">{booth.boothCode}</h3>
                  <p className="mt-1 text-sm text-ink-500">{booth.circle.name} â€¢ {booth.event.name} â€¢ {booth.floorMap.name}</p>
                </div>
                <form action={deleteBoothAction}>
                  <input type="hidden" name="id" value={booth.id} />
                  <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                </form>
              </div>
              <form action={upsertBoothAction} className="mt-5 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={booth.id} />
                <Select name="eventId" defaultValue={booth.eventId} required>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</Select>
                <Select name="circleId" defaultValue={booth.circleId} required>{circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}</Select>
                <Select name="floorMapId" defaultValue={booth.floorMapId} required>{maps.map((map) => <option key={map.id} value={map.id}>{map.name}</option>)}</Select>
                <Input name="boothCode" defaultValue={booth.boothCode} required />
                <Input type="number" name="posX" defaultValue={booth.posX} required />
                <Input type="number" name="posY" defaultValue={booth.posY} required />
                <div className="md:col-span-2"><Textarea name="notes" defaultValue={booth.notes ?? ""} /></div>
                <div className="md:col-span-2 md:text-right"><SubmitButton>Save changes</SubmitButton></div>
              </form>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}


