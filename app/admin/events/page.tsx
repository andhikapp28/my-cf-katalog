export const dynamic = "force-dynamic";

import { deleteEventAction, upsertEventAction } from "@/actions/events";
import { AdminShell } from "@/components/layout/admin-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getEventList } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminEventsPage() {
  const events = await getEventList();

  return (
    <AdminShell title="Events" description="Simpan semua event Comifuro, atur budget, dan tandai event aktif yang akan dipakai dashboard publik.">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel p-5">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">Create event</h2>
          <form action={upsertEventAction} className="mt-5 space-y-4">
            <Input name="name" placeholder="Comifuro 23" required />
            <Input name="slug" placeholder="comifuro-23" required />
            <Input name="venue" placeholder="ICE BSD City" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="datetime-local" name="startsAt" />
              <Input type="datetime-local" name="endsAt" />
            </div>
            <Input type="number" name="budget" placeholder="1500000" required />
            <Textarea name="description" placeholder="Catatan event, target hall, atau agenda belanja utama." />
            <label className="flex items-center gap-3 text-sm text-ink-700"><input type="checkbox" name="isActive" className="h-4 w-4" /> Set as active event</label>
            <SubmitButton>Create event</SubmitButton>
          </form>
        </section>

        <section className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-semibold">{event.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{formatDate(event.startsAt)} â€¢ {formatCurrency(event.budget)}</p>
                </div>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                </form>
              </div>
              <form action={upsertEventAction} className="mt-5 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={event.id} />
                <Input name="name" defaultValue={event.name} required />
                <Input name="slug" defaultValue={event.slug} required />
                <Input name="venue" defaultValue={event.venue ?? ""} />
                <Input type="number" name="budget" defaultValue={event.budget} required />
                <Input type="datetime-local" name="startsAt" defaultValue={event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : ""} />
                <Input type="datetime-local" name="endsAt" defaultValue={event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : ""} />
                <div className="md:col-span-2"><Textarea name="description" defaultValue={event.description ?? ""} /></div>
                <label className="flex items-center gap-3 text-sm text-ink-700"><input type="checkbox" name="isActive" defaultChecked={event.isActive} className="h-4 w-4" /> Active event</label>
                <div className="md:text-right"><SubmitButton>Save changes</SubmitButton></div>
              </form>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}


