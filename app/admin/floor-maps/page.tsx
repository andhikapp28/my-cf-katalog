export const dynamic = "force-dynamic";

import { deleteFloorMapAction, upsertFloorMapAction } from "@/actions/floor-maps";
import { AdminShell } from "@/components/layout/admin-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { ImageFileInput } from "@/components/forms/image-file-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getEventList, getFloorMapsList } from "@/db/queries";

export default async function AdminFloorMapsPage() {
  const [events, maps] = await Promise.all([getEventList(), getFloorMapsList()]);

  return (
    <AdminShell title="Floor Maps" description="Upload denah event ke Vercel Blob dan simpan ukuran asli agar marker booth bisa ditempatkan konsisten.">
      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <section className="panel p-5">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">Upload floor map</h2>
          <form action={upsertFloorMapAction} className="mt-5 space-y-4">
            <Select name="eventId" required>
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </Select>
            <Input name="name" placeholder="Hall A Main Floor" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="number" name="width" placeholder="1200" required />
              <Input type="number" name="height" placeholder="900" required />
            </div>
            <ImageFileInput name="image" label="Map image" />
            <SubmitButton>Save floor map</SubmitButton>
          </form>
        </section>

        <section className="space-y-4">
          {maps.map((map) => (
            <div key={map.id} className="panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-semibold">{map.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{map.event.name} â€¢ {map.width} Ã— {map.height}</p>
                </div>
                <form action={deleteFloorMapAction}>
                  <input type="hidden" name="id" value={map.id} />
                  <input type="hidden" name="imageUrl" value={map.imageUrl} />
                  <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                </form>
              </div>
              <form action={upsertFloorMapAction} className="mt-5 space-y-4">
                <input type="hidden" name="id" value={map.id} />
                <input type="hidden" name="previousImageUrl" value={map.imageUrl} />
                <Select name="eventId" defaultValue={map.eventId} required>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </Select>
                <Input name="name" defaultValue={map.name} required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="number" name="width" defaultValue={map.width} required />
                  <Input type="number" name="height" defaultValue={map.height} required />
                </div>
                <ImageFileInput name="image" label="Replace image" defaultUrl={map.imageUrl} />
                <SubmitButton>Save changes</SubmitButton>
              </form>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}


