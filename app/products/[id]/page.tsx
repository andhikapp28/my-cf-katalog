export const revalidate = 120;

import Link from "next/link";
import { notFound } from "next/navigation";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/products/product-image";
import { WishlistHeartButton } from "@/components/wishlist/wishlist-heart-button";
import { getBoothLocationForCircle, getProductById } from "@/db/queries";
import { formatCurrency } from "@/lib/format";
import {
  eventDayBadgeStyles,
  eventDayLabels,
  eventDayShortLabels,
  priorityStyles,
  statusStyles
} from "@/lib/constants";

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
            {product.isRush ? (
              <Badge className="bg-rose-500 text-white font-bold animate-pulse">
                <Zap className="mr-1 h-3 w-3 fill-white" />
                RUSH
              </Badge>
            ) : null}
            <Badge className={eventDayBadgeStyles[product.targetDay]}>
              {eventDayShortLabels[product.targetDay]}
            </Badge>
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
              <p className="text-ink-500">Jadwal Hunting</p>
              <p className="mt-1 font-medium">{eventDayLabels[product.targetDay]}</p>
            </div>
            <div>
              <p className="text-ink-500">Purchase type</p>
              <p className="mt-1 font-medium">{product.purchaseType}</p>
            </div>
          </div>
          {product.poPickupNotes ? (
            <div className="mt-5 rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 text-sm text-sky-950">
              <p className="font-semibold uppercase tracking-wider text-sky-800">📦 Data Ambil PO (Tunjukkan ke Seller):</p>
              <p className="mt-1 font-mono text-base font-semibold">{product.poPickupNotes}</p>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <WishlistHeartButton
              productId={product.id}
              productName={product.name}
              size="lg"
              showLabel
            />
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

      <section>
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
      </section>
    </div>
  );
}