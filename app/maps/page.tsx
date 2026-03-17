export const dynamic = "force-dynamic";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getFloorMapsList } from "@/db/queries";

export default async function MapsPage() {
  const maps = await getFloorMapsList();

  if (!maps.length) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada floor map" description="Upload denah event dari admin panel untuk mulai melacak booth circle." />
      </div>
    );
  }

  return (
    <div className="container-shell space-y-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Maps</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Floor maps per event</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {maps.map((map) => (
          <Card key={map.id}>
            <CardContent className="space-y-3">
              <p className="text-sm text-ink-500">{map.event.name}</p>
              <Link href={`/maps/${map.id}`} className="font-[var(--font-display)] text-2xl font-semibold text-ink-900 hover:text-brand-700">
                {map.name}
              </Link>
              <p className="text-sm text-ink-500">{map.width} Ã— {map.height}</p>
              <Link href={`/maps/${map.id}`} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700">
                Open map
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


