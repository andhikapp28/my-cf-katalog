export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/products/product-image";
import { getBoothLocationForCircle, getProductById } from "@/db/queries";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { priorityStyles, statusStyles } from "@/lib/constants";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const booth = await getBoothLocationForCircle(product.eventId, product.circleId);

  return (
    <div className="container-shell space-y-8 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="panel overflow-hidden p-4">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-[4/3] rounded-3xl"
            fallbackLabel="No image"
            fallbackDescription="Direct image URL belum diisi atau preview tidak bisa dimuat."
          />
        </div>
        <div className="panel p-6">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusStyles[product.status]}>{product.status.replace("_", " ")}</Badge>
            <Badge className={priorityStyles[product.priority]}>{product.priority}</Badge>
          </div>
          <h1 className="mt-4 font-[var(--font-display)] text-4xl font-semibold tracking-tight">{product.name}</h1>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-ink-700">
            <div>
              <p className="text-ink-500">Circle</p>
              <Link href={`/circles/${product.circleId}`} className="mt-1 inline-flex font-medium text-brand-700">
                {product.circle.name}
              </Link>
            </div>
            <div>
              <p className="text-ink-500">Event</p>
              <p className="mt-1 font-medium">{product.event.name}</p>
            </div>
            <div>
              <p className="text-ink-500">Price</p>
              <p className="mt-1 font-medium">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <p className="text-ink-500">Quantity</p>
              <p className="mt-1 font-medium">{product.quantity}</p>
            </div>
            <div>
              <p className="text-ink-500">PO Deadline</p>
              <p className="mt-1 font-medium">{formatDate(product.poDeadline)}</p>
            </div>
            <div>
              <p className="text-ink-500">Purchase type</p>
              <p className="mt-1 font-medium">{product.purchaseType}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {product.productLink ? (
              <Link href={product.productLink} target="_blank" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-medium text-white">
                Open product link
              </Link>
            ) : null}
            {booth ? (
              <Link href={`/maps/${booth.floorMapId}?circleId=${product.circleId}`} className="rounded-full border border-line px-5 py-3 text-sm font-medium text-ink-700">
                Open booth map
              </Link>
            ) : null}
          </div>
          {product.notes ? <p className="mt-5 rounded-3xl border border-line bg-white/80 p-4 text-sm leading-6 text-ink-600">{product.notes}</p> : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Booth info</h2>
            {booth ? (
              <div className="space-y-3 text-sm text-ink-700">
                <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                  <p className="font-medium text-ink-900">Booth {booth.boothCode}</p>
                  <p className="mt-1 text-ink-500">Floor map: {booth.floorMap.name}</p>
                </div>
                <Link href={`/maps/${booth.floorMapId}?circleId=${product.circleId}`} className="inline-flex rounded-full border border-line px-4 py-2 font-medium text-ink-700">
                  Jump to floor map
                </Link>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Lokasi booth belum diatur untuk event ini.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Status history</h2>
            <div className="space-y-3">
              {product.statusLogs.length ? (
                product.statusLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink-700">
                    <p className="font-medium text-ink-900">
                      {log.fromStatus ? `${log.fromStatus} ? ${log.toStatus}` : log.toStatus}
                    </p>
                    <p className="mt-1 text-ink-500">{formatDateTime(log.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Belum ada riwayat perubahan status.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}