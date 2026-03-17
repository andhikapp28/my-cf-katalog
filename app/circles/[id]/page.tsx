export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getCircleById } from "@/db/queries";
import { formatCurrency } from "@/lib/format";

export default async function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circle = await getCircleById(id);

  if (!circle) {
    notFound();
  }

  return (
    <div className="container-shell space-y-8 py-8">
      <section className="panel p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Circle Profile</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">{circle.name}</h1>
        {circle.notes ? <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-600">{circle.notes}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          {circle.socialLink ? (
            <Link href={circle.socialLink} target="_blank" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">
              Open social
            </Link>
          ) : null}
          <Link href={`/products?circle=${circle.id}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700">
            View products
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Booth locations</h2>
            <div className="space-y-3">
              {circle.locations.length ? (
                circle.locations.map((location) => (
                  <div key={location.id} className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink-700">
                    <p className="font-medium text-ink-900">{location.event.name}</p>
                    <p className="mt-1">Booth {location.boothCode}</p>
                    <Link href={`/maps/${location.floorMapId}?circleId=${circle.id}`} className="mt-2 inline-flex text-brand-700">
                      Open map
                    </Link>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Belum ada lokasi booth untuk circle ini.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Target products</h2>
            <div className="space-y-3">
              {circle.products.length ? (
                circle.products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm hover:border-brand-300">
                    <div>
                      <p className="font-medium text-ink-900">{product.name}</p>
                      <p className="text-ink-500">{product.event.name}</p>
                    </div>
                    <span>{formatCurrency(product.price)}</span>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Belum ada produk yang dikaitkan ke circle ini.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


