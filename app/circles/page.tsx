export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCircleList } from "@/db/queries";

export default async function CirclesPage() {
  const circles = await getCircleList();

  if (!circles.length) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada circle" description="Tambahkan circle di admin panel untuk mulai menghubungkan booth dan produk." />
      </div>
    );
  }

  return (
    <div className="container-shell space-y-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Circles</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Directory circle favorit</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {circles.map((circle) => (
          <Card key={circle.id}>
            <CardContent className="space-y-4">
              <div>
                <Link href={`/circles/${circle.id}`} className="font-[var(--font-display)] text-2xl font-semibold text-ink-900 hover:text-brand-700">
                  {circle.name}
                </Link>
                {circle.notes ? <p className="mt-2 text-sm text-ink-500">{circle.notes}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/products?circle=${circle.id}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700">
                  View items
                </Link>
                {circle.socialLink ? (
                  <Link href={circle.socialLink} target="_blank" className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                    Social link
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


