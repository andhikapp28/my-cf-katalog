export const revalidate = 120;

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Maximize2,
  Zap
} from "lucide-react";
import { ProductImage } from "@/components/products/product-image";
import { ProductCard } from "@/components/products/product-card";
import { PoPickupSlip } from "@/components/products/po-pickup-slip";
import { WishlistHeartButton } from "@/components/wishlist/wishlist-heart-button";
import { getBoothLocationForCircle, getCircleById, getProductById } from "@/db/queries";
import { eventDayLabels, type EventDay } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [booth, circleData] = await Promise.all([
    getBoothLocationForCircle(product.eventId, product.circleId),
    getCircleById(product.circleId)
  ]);

  const targetDay = product.targetDay as EventDay | undefined;
  const isZeroPrice = product.price <= 0;
  const otherProducts = circleData?.products
    ? circleData.products.filter((p) => p.id !== product.id).slice(0, 3)
    : [];

  return (
    <div className="container-shell space-y-10 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-[#111215] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Katalog Produk</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
          <span>{product.event.name}</span>
          <span>/</span>
          <span className="text-[#F84632]">Detail Karya</span>
        </div>
      </div>
      <section className="grid gap-8 lg:grid-cols-[1.05fr_1fr] items-start">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-xs">
            <div className="relative aspect-[4/3] sm:aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-50 flex items-center justify-center">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full rounded-2xl border-0"
                imageClassName="object-contain w-full h-full"
                fallbackLabel="Preview Belum Tersedia"
                fallbackDescription="Circle belum menyematkan gambar langsung untuk katalog ini."
              />
            </div>
          </div>
          {product.imageUrl ? (
            <div className="flex items-center justify-between px-2">
              <a
                href={product.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-500 hover:text-[#111215] transition-colors"
                title="Buka gambar asli resolusi penuh di tab baru"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Buka Gambar Resolusi Penuh</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
              <span className="font-mono text-[11px] text-zinc-400 uppercase">
                Direct Image Link
              </span>
            </div>
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {booth ? (
              <Link
                href={`/maps/${booth.floorMapId}?circleId=${product.circleId}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#111215] px-3.5 py-1.5 font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-[#D6F834] transition hover:bg-[#F84632] hover:text-white shadow-xs"
                title={`Buka Denah Hall untuk Booth ${booth.boothCode}`}
              >
                <MapPin className="h-3.5 w-3.5 text-current" />
                <span>BOOTH {booth.boothCode}</span>
                {booth.floorMap?.name && (
                  <span className="text-white/70 font-medium">({booth.floorMap.name})</span>
                )}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#111215]/80 px-3.5 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300">
                <span>BOOTH TBA</span>
              </span>
            )}
            {targetDay ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-black uppercase tracking-wider shadow-xs",
                  targetDay === "DAY_1" && "bg-[#5398DA] text-[#111215]",
                  targetDay === "DAY_2" && "bg-[#D6F834] text-[#111215]",
                  targetDay === "ALL_DAYS" && "bg-white text-[#111215] border border-zinc-200"
                )}
              >
                {eventDayLabels[targetDay] || targetDay}
              </span>
            ) : null}
            {product.isRush ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F84632] px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-white shadow-xs">
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>INCARAN RUSH</span>
              </span>
            ) : null}
            {product.purchaseType === "PO" ? (
              <span className="inline-flex items-center rounded-md bg-sky-100 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-sky-800">
                Pre-Order
              </span>
            ) : null}
          </div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#111215] leading-[0.98]">
            {product.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
              Karya Circle:
            </span>
            <Link
              href={`/circles/${product.circle.id}`}
              className="inline-flex items-center gap-1 font-mono text-base font-bold text-[#111215] hover:text-[#F84632] transition-colors underline underline-offset-4"
              title={`Buka profil circle ${product.circle.name}`}
            >
              <span>{product.circle.name}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-5">
            {isZeroPrice ? (
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2">
                  <span className="rounded-lg bg-[#111215] px-2.5 py-1 font-mono text-xs font-black uppercase text-[#D6F834]">
                    Sampel Karya
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Katalog Meja Resmi
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  Item ini merupakan sampel karya display meja dari circle. Harga atau bundle dapat dicek langsung di booth saat acara berlangsung.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Estimasi Harga Karya
                </p>
                <p className="font-mono text-3xl sm:text-4xl font-black text-[#111215] tracking-tight">
                  {formatCurrency(product.price)}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <WishlistHeartButton
              productId={product.id}
              productName={product.name}
              size="lg"
              showLabel
              className="min-h-[48px] px-6 text-sm font-mono font-black"
            />

            {booth ? (
              <Link
                href={`/maps/${booth.floorMapId}?circleId=${product.circleId}`}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#5398DA] px-6 py-3 font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-[#111215] transition hover:bg-[#4383c2] shadow-xs active:scale-[0.98]"
              >
                <MapPin className="h-4 w-4" />
                <span>Lihat di Peta Hall</span>
              </Link>
            ) : null}

            {product.productLink ? (
              <a
                href={product.productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-5 py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111215] transition hover:border-[#111215] hover:bg-zinc-50 active:scale-[0.98]"
              >
                <span>Buka Web Circle</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
          {product.poPickupNotes ? (
            <div className="pt-2">
              <PoPickupSlip
                poPickupNotes={product.poPickupNotes}
                productName={product.name}
              />
            </div>
          ) : null}
          {product.notes ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
                Catatan Circle / Deskripsi Karya:
              </p>
              <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-line font-sans">
                {product.notes}
              </p>
            </div>
          ) : null}
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2 pt-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="font-[var(--font-display)] text-2xl font-bold uppercase text-[#111215]">
              Lokasi Booth
            </h2>
            <MapPin className="h-5 w-5 text-[#F84632]" />
          </div>

          {booth ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1 rounded-xl bg-zinc-50 p-4 border border-zinc-200">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Nomor Booth & Hall
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-[#111215]">
                    {booth.boothCode}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-600">
                    · {booth.floorMap.name}
                  </span>
                </div>
              </div>

              <Link
                href={`/maps/${booth.floorMapId}?circleId=${product.circleId}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111215] py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#F84632] shadow-xs"
              >
                <span>Buka Denah Peta Hall</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center font-mono text-xs text-zinc-500">
              Lokasi booth circle ini belum diumumkan atau belum tercatat pada denah resmi.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="font-[var(--font-display)] text-2xl font-bold uppercase text-[#111215]">
              Profil Circle
            </h2>
            <Link
              href={`/circles/${product.circle.id}`}
              className="text-xs font-mono font-bold text-[#F84632] hover:underline"
            >
              Lihat Profil Circle →
            </Link>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-lg font-bold text-[#111215]">
              {product.circle.name}
            </p>

            {circleData?.notes ? (
              <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                {circleData.notes}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              {circleData?.socialLink ? (
                <a
                  href={circleData.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 font-mono text-xs font-bold text-[#111215] transition hover:border-[#111215] hover:bg-white"
                >
                  <span>Medsos / X</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}

              <Link
                href={`/products?circle=${product.circleId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 font-mono text-xs font-bold text-[#111215] transition hover:border-[#111215] hover:bg-white"
              >
                <span>Lihat Semua Katalog Circle</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {otherProducts.length > 0 ? (
        <section className="space-y-6 pt-6 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#F84632]">
                KATALOG CIRCLE LAINNYA
              </p>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl font-black uppercase text-[#111215]">
                Karya Lain dari {product.circle.name}
              </h2>
            </div>

            <Link
              href={`/products?circle=${product.circleId}`}
              className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase text-[#111215] hover:text-[#F84632] transition-colors"
            >
              <span>Lihat Semua Karya</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {otherProducts.map((otherItem) => (
              <ProductCard
                key={otherItem.id}
                product={{
                  ...otherItem,
                  circle: product.circle,
                  event: product.event
                }}
                boothCode={booth?.boothCode || null}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
