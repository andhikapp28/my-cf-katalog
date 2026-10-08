"use client";

import { useMemo } from "react";
import { WishlistHeartButton } from "@/components/wishlist/wishlist-heart-button";
import { parseCircleNotes } from "@/lib/floor-map";
import { cn } from "@/lib/utils";

export interface CompactCircleProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  productLink?: string | null;
  purchaseType?: string | null;
  isRush?: boolean | null;
  poPickupNotes?: string | null;
  status?: string | null;
  priority?: string | null;
  targetDay?: string | null;
}

export interface CompactCircleLocation {
  id?: string;
  boothCode: string;
  day?: string | null;
  floorMapId?: string | null;
  floorMapName?: string | null;
  event?: {
    id: string;
    name: string;
  } | null;
}

export interface CompactCircleItem {
  id: string;
  name: string;
  slug?: string;
  notes?: string | null;
  socialLink?: string | null;
  circleCutUrl?: string | null;
  fandom?: string | null;
  categories?: string[];
  rating?: string;
  day?: string | null;
  boothCode?: string | null;
  locations?: CompactCircleLocation[];
  products?: CompactCircleProduct[];
  productCount?: number;
  description?: string | null;
  socialLinks?: Array<{ platform: string; url: string; label: string }>;
}

export interface CompactCircleCardProps {
  circle: CompactCircleItem;
  onSelectCircle?: (circle: CompactCircleItem) => void;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatCircleImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith("http")) return null;
  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    return encodeURI(trimmed);
  }
}

function resolveDayConfig(dayStr?: string | null): { label: string; className: string } {
  if (!dayStr) {
    return {
      label: "Both Days",
      className: "bg-white text-[#111215] border border-zinc-200"
    };
  }

  const normalized = dayStr.replace(/[\s-]+/g, "_").toUpperCase();

  if (normalized.includes("1") && !normalized.includes("2")) {
    return {
      label: "Day 1",
      className: "bg-[#5398DA] text-[#111215]"
    };
  }

  if (normalized.includes("2") && !normalized.includes("1")) {
    return {
      label: "Day 2",
      className: "bg-[#D6F834] text-[#111215]"
    };
  }

  return {
    label: "Both Days",
    className: "bg-white text-[#111215] border border-zinc-200"
  };
}

export function CompactCircleCard({
  circle,
  onSelectCircle,
  className
}: CompactCircleCardProps) {
  const parsedMeta = useMemo(() => {
    return parseCircleNotes(circle.notes, circle.socialLink);
  }, [circle.notes, circle.socialLink]);

  const boothCode =
    circle.boothCode ||
    circle.locations?.[0]?.boothCode ||
    "TBA";

  const rawDay = circle.day || circle.locations?.[0]?.day || "ALL_DAYS";
  const dayConfig = resolveDayConfig(rawDay);

  const rawCircleCutUrl =
    circle.circleCutUrl ||
    parsedMeta.circleCutUrl ||
    circle.products?.find((p) => p.imageUrl)?.imageUrl ||
    null;
  const circleCutUrl = formatCircleImageUrl(rawCircleCutUrl);

  const rawFandom = circle.fandom || parsedMeta.fandom;
  const fandom =
    rawFandom?.replace(/\s*\(\s*-\s*\)/g, "").replace(/\s*-\s*$/, "").trim() ||
    null;
  const categories =
    circle.categories && circle.categories.length > 0
      ? circle.categories
      : parsedMeta.categories;

  const tagsText =
    [
      fandom,
      categories.length > 0 ? categories.slice(0, 2).join(", ") : null
    ]
      .filter(Boolean)
      .join(" · ") || "Katalog Comifuro";

  const productCount = circle.productCount ?? circle.products?.length ?? 0;
  const rating = circle.rating || parsedMeta.rating;

  const handleClick = () => {
    onSelectCircle?.(circle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectCircle?.(circle);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Circle ${circle.name}, Booth ${boothCode}`}
      className={cn(
        "group relative flex items-center gap-3 sm:gap-3.5 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 sm:p-3.5 text-left transition-all duration-200 hover:border-zinc-400 hover:shadow-lg hover:shadow-zinc-950/5 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215] select-none",
        className
      )}
    >
      <div className="relative h-[72px] w-[72px] sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        {circleCutUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={circleCutUrl}
            alt={circle.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={cn(
            "h-full w-full items-center justify-center bg-[#111215] text-[#D6F834] font-[var(--font-display)] text-2xl uppercase tracking-wider",
            circleCutUrl ? "hidden" : "flex"
          )}
        >
          {getInitials(circle.name)}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5 gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            title={`Lokasi Booth: ${boothCode}`}
            className="inline-flex items-center rounded-md bg-[#111215] px-2 py-0.5 font-mono text-[11px] sm:text-xs font-black tracking-wider text-[#D6F834] uppercase border border-white/10 shrink-0"
          >
            {boothCode}
          </span>

          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 shadow-2xs",
              dayConfig.className
            )}
          >
            {dayConfig.label}
          </span>

          {rating === "M" && (
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 font-mono text-[10px] font-black text-red-700 border border-red-300 uppercase shrink-0">
              18+
            </span>
          )}
        </div>
        <div className="min-w-0 space-y-0.5">
          <h3 className="font-sans font-bold text-sm sm:text-base text-ink-900 group-hover:text-[#F84632] transition-colors line-clamp-1 leading-snug">
            {circle.name}
          </h3>
          <p className="font-mono text-xs text-zinc-500 line-clamp-1">
            {tagsText}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="font-mono text-xs font-bold text-zinc-500">
            {productCount > 0 ? `${productCount} Karya` : "Info Booth"}
          </span>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#111215] group-hover:text-[#F84632] transition-colors">
            {productCount > 0 ? "LIHAT KARYA" : "DETAIL CIRCLE"}
          </span>
        </div>
      </div>
      <div
        className="shrink-0 self-start"
        onClick={(e) => e.stopPropagation()}
      >
        <WishlistHeartButton
          productId={circle.id}
          productName={circle.name}
          isCircle
          circleProductIds={circle.products?.map((p) => p.id)}
          size="sm"
          className="shadow-2xs"
        />
      </div>
    </article>
  );
}
