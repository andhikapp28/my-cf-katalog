"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BannerState = "loading" | "loaded" | "error" | "empty";

function getEventState(startsAt?: string | Date | null, isActive?: boolean) {
  if (isActive) {
    return "Active Event";
  }

  if (startsAt && new Date(startsAt).getTime() > Date.now()) {
    return "Upcoming Event";
  }

  return "Selected Event";
}

export function ExpenseEventHeader({
  name,
  venue,
  startsAt,
  endsAt,
  bannerImageUrl,
  isActive,
  className
}: {
  name: string;
  venue?: string | null;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  bannerImageUrl?: string | null;
  isActive?: boolean;
  className?: string;
}) {
  const normalizedSrc = bannerImageUrl?.trim() || null;
  const [state, setState] = useState<BannerState>(normalizedSrc ? "loading" : "empty");

  useEffect(() => {
    setState(normalizedSrc ? "loading" : "empty");
  }, [normalizedSrc]);

  return (
    <section className={cn("relative overflow-hidden rounded-[30px] border border-line/80 bg-ink-900 text-white", className)}>
      {normalizedSrc && state !== "error" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalizedSrc}
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center transition duration-300",
            state === "loaded" ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}

      {normalizedSrc && state === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(212,106,58,0.12),rgba(255,255,255,0.12),rgba(212,106,58,0.08))]" />
      ) : null}

      {state === "empty" || state === "error" ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_26%),linear-gradient(115deg,#211815_0%,#563528_44%,#d46a3a_100%)]" />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,14,12,0.78)_0%,rgba(19,14,12,0.68)_38%,rgba(19,14,12,0.26)_72%,rgba(19,14,12,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,106,58,0.18),transparent_34%)]" />

      <div className="relative grid min-h-[180px] gap-4 p-5 sm:min-h-[210px] sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/20 bg-white/10 text-white ring-white/20">{getEventState(startsAt, isActive)}</Badge>
            {isActive ? <Badge className="bg-emerald-200/90 text-emerald-900">ACTIVE</Badge> : null}
            {state === "empty" || state === "error" ? (
              <Badge className="border-white/16 bg-black/18 text-white/78 ring-white/12">
                {state === "error" ? "Banner unavailable" : "No event banner"}
              </Badge>
            ) : null}
          </div>

          <div>
            <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              Ringkasan budget dan spending saat ini sedang difokuskan untuk event ini.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end lg:text-right">
          <div className="rounded-full border border-white/14 bg-black/18 px-4 py-2 text-sm text-white/82 backdrop-blur-sm">
            {venue || "Venue belum diisi"}
          </div>
          <div className="rounded-full border border-white/14 bg-black/18 px-4 py-2 text-sm text-white/82 backdrop-blur-sm">
            {formatDateRange(startsAt, endsAt)}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDateRange(startsAt?: string | Date | null, endsAt?: string | Date | null) {
  const startLabel = formatCompactDate(startsAt);
  const endLabel = formatCompactDate(endsAt);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel || endLabel || "Tanggal event belum diisi";
}

function formatCompactDate(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
