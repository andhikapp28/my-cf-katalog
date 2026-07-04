export const dynamic = "force-dynamic";

import { CatalogEntryForm } from "@/components/admin/catalog-entry-form";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCircleList, getEventList, getFloorMapsList } from "@/db/queries";

export default async function NewCatalogEntryPage() {
  const [events, circles, floorMaps] = await Promise.all([
    getEventList(),
    getCircleList(),
    getFloorMapsList()
  ]);

  return (
    <AdminShell
      title="Tambah ke Katalog"
      description="Jalur cepat: pilih/buat circle, set booth (opsional), dan tambah beberapa target produk sekaligus dalam satu layar."
    >
      <CatalogEntryForm
        events={events.map((event) => ({ id: event.id, name: event.name, isActive: event.isActive }))}
        circles={circles.map((circle) => ({ id: circle.id, name: circle.name }))}
        floorMaps={floorMaps.map((map) => ({ id: map.id, name: map.name, eventId: map.eventId }))}
      />
    </AdminShell>
  );
}
