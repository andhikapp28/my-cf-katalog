import Link from "next/link";
import { ArrowUpRight, ExternalLink, Zap } from "lucide-react";
import { ProductImage } from "@/components/products/product-image";
import { WishlistHeartButton } from "@/components/wishlist/wishlist-heart-button";
import { eventDayShortLabels, type EventDay } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    quantity?: number;
    poDeadline?: string | null;
    productLink?: string | null;
    status?: string;
    priority?: string;
    purchaseType?: string;
    targetDay?: EventDay | string;
    isRush?: boolean;
    poPickupNotes?: string | null;
    circle: { id: string; name: string };
    event?: { id: string; name: string };
  };
  boothCode?: string | null;
}

export function ProductCard({ product, boothCode }: ProductCardProps) {
  const isZeroPrice = product.price <= 0;
  const targetDay = product.targetDay as EventDay | undefined;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:shadow-zinc-950/5">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full rounded-none border-0"
          imageClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
          fallbackLabel="No image"
          fallbackDescription="Preview karya belum tersedia dari circle."
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-48px)]">
          <span
            title={boothCode ? `Lokasi Booth: ${boothCode}` : "Lokasi Booth Belum Diumumkan"}
            className="inline-flex items-center gap-1 rounded-md bg-[#111215] px-2.5 py-1 font-mono text-xs font-black tracking-wider text-[#D6F834] shadow-md border border-white/10 uppercase"
          >
            <span>BOOTH</span>
            <span className="text-white">{boothCode || "TBA"}</span>
          </span>
          {targetDay ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider shadow-sm",
                targetDay === "DAY_1" && "bg-[#5398DA] text-[#111215]",
                targetDay === "DAY_2" && "bg-[#D6F834] text-[#111215]",
                targetDay === "ALL_DAYS" && "bg-white text-[#111215] border border-zinc-200"
              )}
            >
              {eventDayShortLabels[targetDay] || targetDay}
            </span>
          ) : null}
          {product.isRush ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F84632] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white shadow-sm">
              <Zap className="h-2.5 w-2.5 fill-white" />
              <span>RUSH</span>
            </span>
          ) : null}
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <WishlistHeartButton
            productId={product.id}
            productName={product.name}
            size="sm"
            className="shadow-md"
          />
        </div>
        {product.purchaseType === "PO" ? (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="rounded-md bg-[#111215]/85 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase border border-white/10 shadow-xs">
              Pre-Order
            </span>
          </div>
        ) : null}
      </div>
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-1.5">
          <Link
            href={`/circles/${product.circle.id}`}
            className="group/circle inline-flex items-center gap-1 font-mono text-xs font-bold text-zinc-600 hover:text-[#F84632] transition-colors max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] rounded-sm"
            title={`Lihat profil circle ${product.circle.name}`}
          >
            <span className="truncate group-hover/circle:underline">{product.circle.name}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 group-hover/circle:opacity-100 transition-opacity" />
          </Link>
          <Link
            href={`/products/${product.id}`}
            className="block font-[var(--font-display)] text-xl sm:text-2xl font-bold tracking-tight text-[#111215] group-hover:text-[#F84632] transition-colors line-clamp-2 leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] rounded-sm"
          >
            {product.name}
          </Link>
        </div>
        <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
          {isZeroPrice ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-600">
                Display
              </span>
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-700">
                Sampel Karya
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-600">
                Harga
              </span>
              <span className="font-mono text-base sm:text-lg font-black tracking-tight text-[#111215]">
                {formatCurrency(product.price)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            {product.productLink ? (
              <a
                href={product.productLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buka tautan eksternal untuk ${product.name}`}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:border-[#111215] hover:text-[#111215] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                title="Buka tautan katalog circle"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}

            <Link
              href={`/products/${product.id}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#111215] px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#F84632] shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
            >
              <span>Detail</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
