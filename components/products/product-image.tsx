"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageState = "empty" | "loading" | "loaded" | "error";

export function ProductImage({
  src,
  alt,
  className,
  imageClassName,
  fallbackLabel = "No Image",
  fallbackDescription,
  showLoading = true
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackLabel?: string;
  fallbackDescription?: string;
  showLoading?: boolean;
}) {
  const normalizedSrc = normalizeUrl(src);
  const [state, setState] = useState<ProductImageState>(normalizedSrc ? "loading" : "empty");
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setState(normalizedSrc ? "loading" : "empty");
  }, [normalizedSrc]);

  useEffect(() => {
    if (!normalizedSrc) {
      return;
    }

    const image = imageRef.current;

    if (!image || !image.complete) {
      return;
    }

    setState(image.naturalWidth > 0 ? "loaded" : "error");
  }, [normalizedSrc]);

  return (
    <div className={cn("relative overflow-hidden rounded-[26px] border border-line bg-brand-50", className)}>
      {normalizedSrc && state !== "error" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          src={normalizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn("h-full w-full object-cover", imageClassName, state === "loaded" ? "opacity-100" : "opacity-0")}
        />
      ) : null}

      {state === "loading" && showLoading ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(212,106,58,0.16),rgba(255,255,255,0.92),rgba(212,106,58,0.10))]" />
      ) : null}

      {state === "empty" || state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(212,106,58,0.16),_transparent_58%)] px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
            {state === "error" ? "Image preview unavailable" : fallbackLabel}
          </p>
          <p className="mt-2 text-xs leading-5 text-ink-500">
            {fallbackDescription ??
              (state === "error"
                ? "Periksa ulang direct image URL yang dipakai."
                : "Tambahkan direct image URL untuk menampilkan preview produk.")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
