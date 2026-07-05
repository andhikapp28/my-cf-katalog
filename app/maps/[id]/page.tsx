export const revalidate = 120;

import { notFound } from "next/navigation";
import { FloorMapViewer } from "@/components/maps/floor-map-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { getMapById, getRelatedProductsByCircle } from "@/db/queries";
import { isDoneProductStatus } from "@/lib/checklist";

export default async function MapDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const selectedCircleId = typeof query.circleId === "string" ? query.circleId : undefined;

  const map = await getMapById(id);

  if (!map) {
    notFound();
  }

  const markers = await Promise.all(
    map.boothLocations.map(async (location) => {
      const circleProducts = await getRelatedProductsByCircle(map.eventId, location.circleId);

      // Highlight: booth punya produk priority HIGH ATAU masih berstatus
      // TARGET/PO_OPEN (masih perlu diburu) untuk event map ini.
      const isHighlighted = circleProducts.some(
        (product) => product.priority === "HIGH" || product.status === "TARGET" || product.status === "PO_OPEN"
      );
      // Selesai: SEMUA produk booth ini sudah PURCHASED/CANCELLED/SOLD_OUT.
      // `.every()` pada array kosong bernilai true (booth tanpa target produk
      // dianggap "selesai" karena tidak ada yang perlu diburu di sana).
      const isDone = circleProducts.every((product) => isDoneProductStatus(product.status));

      return {
        id: location.id,
        circleId: location.circleId,
        circleName: location.circle.name,
        boothCode: location.boothCode,
        posX: location.posX,
        posY: location.posY,
        isHighlighted,
        isDone,
        products: circleProducts
          .filter((product) => !isDoneProductStatus(product.status))
          .map((product) => ({
            id: product.id,
            name: product.name
          }))
      };
    })
  );

  return (
    <div className="container-shell space-y-6 py-8">
      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Floor Map</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">{map.name}</h1>
        <p className="mt-2 text-sm text-ink-500">{map.event.name}</p>
      </section>
      <FloorMapViewer
        name={map.name}
        imageUrl={map.imageUrl}
        width={map.width}
        height={map.height}
        markers={markers}
        initialCircleId={selectedCircleId}
      />
      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">Marker guide</h2>
          <p className="text-sm text-ink-500">Koordinat marker disimpan sebagai persentase `x/y` terhadap gambar map, jadi tetap fleksibel saat ukuran tampilan berubah di mobile maupun desktop.</p>
        </CardContent>
      </Card>
    </div>
  );
}


