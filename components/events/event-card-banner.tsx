"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type EventCardBannerState = "loading" | "loaded" | "error" | "empty";

export function EventCardBanner({
  src,
  alt,
  className
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const normalizedSrc = src?.trim() || null;
  const [state, setState] = useState<EventCardBannerState>(normalizedSrc ? "loading" : "empty");

  useEffect(() => {
    setState(normalizedSrc ? "loading" : "empty");
  }, [normalizedSrc]);

  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden rounded-[24px] border border-line bg-[radial-gradient(circle_at_top,_rgba(212,106,58,0.16),_transparent_58%),linear-gradient(135deg,#fff7f2_0%,#fffdfb_52%,#f7ede7_100%)]",
        className
      )}
    >
      {normalizedSrc && state !== "error" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn(
            "h-full w-full object-cover transition duration-300",
            state === "loaded" ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}

      {state === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(212,106,58,0.14),rgba(255,255,255,0.92),rgba(212,106,58,0.08))]" />
      ) : null}

      {(state === "empty" || state === "error") ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
            {state === "error" ? "Event banner unavailable" : "No banner"}
          </p>
          <p className="mt-2 max-w-[18rem] text-xs leading-5 text-ink-500">
            {state === "error"
              ? "Banner gagal dimuat. Periksa kembali URL gambar event."
              : "Tambahkan banner event agar listing Comifuro terasa lebih hidup dan mudah dipindai."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
