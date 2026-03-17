export const dynamic = "force-dynamic";

import { deleteCircleAction, upsertCircleAction } from "@/actions/circles";
import { AdminShell } from "@/components/layout/admin-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCircleList } from "@/db/queries";

export default async function AdminCirclesPage() {
  const circles = await getCircleList();

  return (
    <AdminShell title="Circles" description="Kelola directory circle global, link sosial utama, dan catatan yang nanti dipakai ulang lintas event.">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel p-5">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">Add circle</h2>
          <form action={upsertCircleAction} className="mt-5 space-y-4">
            <Input name="name" placeholder="Atelier Hanami" required />
            <Input name="slug" placeholder="atelier-hanami" required />
            <Input name="socialLink" placeholder="https://instagram.com/..." />
            <Textarea name="notes" placeholder="Catatan circle, style merch, atau reminder khusus." />
            <SubmitButton>Create circle</SubmitButton>
          </form>
        </section>

        <section className="space-y-4">
          {circles.map((circle) => (
            <div key={circle.id} className="panel p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-[var(--font-display)] text-2xl font-semibold">{circle.name}</h3>
                <form action={deleteCircleAction}>
                  <input type="hidden" name="id" value={circle.id} />
                  <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                </form>
              </div>
              <form action={upsertCircleAction} className="mt-5 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={circle.id} />
                <Input name="name" defaultValue={circle.name} required />
                <Input name="slug" defaultValue={circle.slug} required />
                <div className="md:col-span-2"><Input name="socialLink" defaultValue={circle.socialLink ?? ""} /></div>
                <div className="md:col-span-2"><Textarea name="notes" defaultValue={circle.notes ?? ""} /></div>
                <div className="md:col-span-2 md:text-right"><SubmitButton>Save changes</SubmitButton></div>
              </form>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}


