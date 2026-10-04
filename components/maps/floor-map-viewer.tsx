"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Navigation, Plus, RotateCcw, Zap } from "lucide-react";
import { clampScale, computeFocalTranslate, pickNextBooth, FLOOR_MAP_MIN_SCALE } from "@/lib/floor-map";
import { eventDayBadgeStyles, eventDayShortLabels, type EventDay } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Marker = {
  id: string;
  circleId: string;
  circleName: string;
  boothCode: string;
  day?: string;
  hasRush?: boolean;
  posX: number;
  posY: number;
  isHighlighted: boolean;
  isDone: boolean;
  products: Array<{ id: string; name: string; isRush?: boolean }>;
};

type Transform = { scale: number; x: number; y: number };

const TARGET_ZOOM_SCALE = 2.2;

/**
 * Floor map viewer dengan pinch-zoom & pan manual (CSS transform + Pointer
 * Events), tanpa library eksternal.
 *
 * Kenapa manual, bukan library: kebutuhan di sini terbatas (zoom + pan pada
 * satu gambar statis dengan overlay marker persentase), jadi menambah
 * dependency (mis. react-zoom-pan-pinch ~15kb+, atau library gesture yang
 * lebih besar) untuk kasus sesempit ini tidak sepadan dengan bundle size
 * ekstra pada halaman publik yang harus tetap ringan untuk dipakai di venue
 * dengan sinyal jelek. Pointer Events (bukan touch events terpisah) dipakai
 * supaya satu set handler berlaku untuk touch (HP) maupun mouse (desktop).
 */
export function FloorMapViewer({
  name,
  imageUrl,
  width,
  height,
  markers,
  initialCircleId,
  halls
}: {
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  markers: Marker[];
  initialCircleId?: string;
  halls?: Array<{ id: string; name: string; hall?: string | null }>;
}) {
  const [activeId, setActiveId] = useState<string | undefined>(initialCircleId ?? markers[0]?.circleId);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{
    mode: "none" | "pan" | "pinch";
    startTransform: Transform;
    startMidpoint: { x: number; y: number };
    startDistance: number;
  }>({ mode: "none", startTransform: { scale: 1, x: 0, y: 0 }, startMidpoint: { x: 0, y: 0 }, startDistance: 0 });

  const activeMarker = useMemo(
    () => markers.find((item) => item.circleId === activeId) ?? markers[0],
    [activeId, markers]
  );

  const activeBoothId = useMemo(
    () => markers.find((item) => item.circleId === activeId)?.id,
    [activeId, markers]
  );

  const clampTranslate = useCallback((next: Transform, rect: { width: number; height: number }) => {
    const minX = rect.width * (1 - next.scale);
    const minY = rect.height * (1 - next.scale);
    return {
      scale: next.scale,
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y))
    };
  }, []);

  function getMidpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function relativePoint(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 1) {
      gestureRef.current = {
        mode: "pan",
        startTransform: transform,
        startMidpoint: relativePoint(event.clientX, event.clientY),
        startDistance: 0
      };
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      gestureRef.current = {
        mode: "pinch",
        startTransform: transform,
        startMidpoint: getMidpoint(relativePoint(a.x, a.y), relativePoint(b.x, b.y)),
        startDistance: getDistance(a, b)
      };
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const gesture = gestureRef.current;

    if (gesture.mode === "pan" && pointers.current.size === 1) {
      if (transform.scale <= FLOOR_MAP_MIN_SCALE) {
        return;
      }
      const current = relativePoint(event.clientX, event.clientY);
      const dx = current.x - gesture.startMidpoint.x;
      const dy = current.y - gesture.startMidpoint.y;
      setTransform(
        clampTranslate(
          { scale: gesture.startTransform.scale, x: gesture.startTransform.x + dx, y: gesture.startTransform.y + dy },
          rect
        )
      );
    } else if (gesture.mode === "pinch" && pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = getDistance(a, b);
      const midpoint = getMidpoint(relativePoint(a.x, a.y), relativePoint(b.x, b.y));
      const scaleRatio = distance / (gesture.startDistance || distance);
      const nextScale = clampScale(gesture.startTransform.scale * scaleRatio);
      const { translateX, translateY } = computeFocalTranslate({
        focalX: midpoint.x,
        focalY: midpoint.y,
        prevScale: gesture.startTransform.scale,
        nextScale,
        prevTranslateX: gesture.startTransform.x,
        prevTranslateY: gesture.startTransform.y
      });
      setTransform(clampTranslate({ scale: nextScale, x: translateX, y: translateY }, rect));
    }
  }

  function endPointer(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      gestureRef.current.mode = "none";
    } else if (pointers.current.size === 1) {
      const [remaining] = Array.from(pointers.current.values());
      gestureRef.current = {
        mode: "pan",
        startTransform: transform,
        startMidpoint: relativePoint(remaining.x, remaining.y),
        startDistance: 0
      };
    }
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const focal = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const delta = event.deltaY > 0 ? -0.15 : 0.15;
    const nextScale = clampScale(transform.scale + delta * transform.scale);
    const { translateX, translateY } = computeFocalTranslate({
      focalX: focal.x,
      focalY: focal.y,
      prevScale: transform.scale,
      nextScale,
      prevTranslateX: transform.x,
      prevTranslateY: transform.y
    });
    setTransform(clampTranslate({ scale: nextScale, x: translateX, y: translateY }, rect));
  }

  function zoomBy(delta: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const focal = { x: rect.width / 2, y: rect.height / 2 };
    const nextScale = clampScale(transform.scale + delta);
    const { translateX, translateY } = computeFocalTranslate({
      focalX: focal.x,
      focalY: focal.y,
      prevScale: transform.scale,
      nextScale,
      prevTranslateX: transform.x,
      prevTranslateY: transform.y
    });
    setTransform(clampTranslate({ scale: nextScale, x: translateX, y: translateY }, rect));
  }

  function resetZoom() {
    setTransform({ scale: 1, x: 0, y: 0 });
  }

  function focusMarker(marker: Marker, scale = TARGET_ZOOM_SCALE) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      setActiveId(marker.circleId);
      return;
    }
    const localX = (marker.posX / 100) * rect.width;
    const localY = (marker.posY / 100) * rect.height;
    const nextX = rect.width / 2 - scale * localX;
    const nextY = rect.height / 2 - scale * localY;
    setTransform(clampTranslate({ scale, x: nextX, y: nextY }, rect));
    setActiveId(marker.circleId);
  }

  function goToNextBooth() {
    const booth = pickNextBooth(
      markers.map((marker) => ({
        id: marker.id,
        boothCode: marker.boothCode,
        isDone: marker.isDone,
        isHighlighted: marker.isHighlighted
      })),
      activeBoothId
    );

    if (!booth) {
      return;
    }

    const marker = markers.find((item) => item.id === booth.id);
    if (marker) {
      focusMarker(marker);
    }
  }

  const pendingHighlightCount = markers.filter((marker) => marker.isHighlighted && !marker.isDone).length;

  return (
    <div className="space-y-4">
      {halls && halls.length > 1 ? (
        <div className="panel flex flex-wrap items-center gap-2 p-3 sm:p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Pilih Hall Venue:</span>
          {halls.map((h) => (
            <Link
              key={h.id}
              href={`/maps/${h.id}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition border",
                h.name === name
                  ? "bg-brand-500 text-white border-brand-600 shadow-sm"
                  : "bg-white/80 text-ink-700 border-line hover:bg-brand-50"
              )}
            >
              {h.hall ? `${h.hall} · ${h.name}` : h.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel overflow-hidden p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-ink-500">
            {pendingHighlightCount > 0
              ? `${pendingHighlightCount} booth target belum selesai`
              : "Semua booth target sudah selesai"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => zoomBy(-0.6)}
              aria-label="Perkecil"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/90 text-ink-600 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(0.6)}
              aria-label="Perbesar"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/90 text-ink-600 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              aria-label="Reset zoom"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/90 text-ink-600 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNextBooth}
              disabled={pendingHighlightCount === 0 && markers.every((m) => m.isDone)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-50"
            >
              <Navigation className="h-4 w-4" />
              Next booth
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative touch-none select-none overflow-hidden rounded-3xl border border-line bg-white"
          style={{ aspectRatio: `${width}/${height}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onPointerLeave={endPointer}
          onWheel={handleWheel}
          onDoubleClick={() => (transform.scale > FLOOR_MAP_MIN_SCALE ? resetZoom() : zoomBy(1.2))}
        >
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transition: "transform 150ms ease-out"
            }}
          >
            <Image src={imageUrl} alt={name} fill unoptimized className="object-cover" draggable={false} />
            {markers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                onClick={() => setActiveId(marker.circleId)}
                className={cn(
                  "absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition",
                  marker.circleId === activeId ? "scale-125 bg-brand-500" : "bg-ink-900/80",
                  marker.isHighlighted && !marker.isDone && "ring-4 ring-rose-400/70 animate-pulse",
                  marker.isDone && "opacity-40"
                )}
                style={{ left: `${marker.posX}%`, top: `${marker.posY}%` }}
                aria-label={`${marker.circleName}${marker.isHighlighted && !marker.isDone ? " (target prioritas)" : ""}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Cubit dua jari untuk zoom, geser untuk pan di HP. Di desktop pakai scroll/tombol +/- atau double-click.
        </p>
      </div>
      <div className="panel p-5">
        {activeMarker ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Selected Booth</p>
                <h3 className="mt-1 font-[var(--font-display)] text-2xl font-semibold">{activeMarker.circleName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink-700">Booth {activeMarker.boothCode}</span>
                  {activeMarker.day ? (
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", eventDayBadgeStyles[activeMarker.day as EventDay])}>
                      {eventDayShortLabels[activeMarker.day as EventDay]}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {activeMarker.hasRush ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm animate-pulse">
                    <Zap className="h-3 w-3 fill-white" />
                    RUSH
                  </span>
                ) : null}
                {activeMarker.isHighlighted && !activeMarker.isDone ? (
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                    Target
                  </span>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-700">Target products</p>
              <div className="mt-3 space-y-2">
                {activeMarker.products.length ? (
                  activeMarker.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      <span>{product.name}</span>
                      {product.isRush ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          <Zap className="h-3 w-3 fill-current" />
                          RUSH
                        </span>
                      ) : null}
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">Belum ada target item untuk circle ini.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-500">Belum ada marker booth untuk map ini.</p>
        )}
      </div>
    </div>
    </div>
  );
}
