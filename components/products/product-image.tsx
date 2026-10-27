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
  fallbackDescription: _fallbackDescription,
  showLoading = true,
  loading = "lazy"
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackLabel?: string;
  fallbackDescription?: string;
  showLoading?: boolean;
  loading?: "lazy" | "eager";
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
    <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-brand-50", className)}>
      {normalizedSrc && state !== "error" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          src={normalizedSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn("h-full w-full object-cover", imageClassName, state === "loaded" ? "opacity-100" : "opacity-0")}
        />
      ) : null}

      {state === "loading" && showLoading ? (
        <div className="absolute inset-0 bg-zinc-100" />
      ) : null}

      {state === "empty" || state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 px-4 text-center">
          <p className="text-xs font-medium text-zinc-400">
            {state === "error" ? "Preview tidak tersedia" : fallbackLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    return null;
  }
  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    return encodeURI(trimmed);
  }
}
