"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Layers,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Search,
  X
} from "lucide-react";
import {
  clampScale,
  computeFocalTranslate,
  filterCircleMarkers,
  pickNextBooth,
  FLOOR_MAP_MIN_SCALE,
  type CircleMarker
} from "@/lib/floor-map";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  isCircleInWishlist,
  subscribeWishlist
} from "@/lib/wishlist";
import { IceHallCanvas } from "./ice-hall-canvas";
import { CircleDetailSheet } from "./circle-detail-sheet";
import { cn } from "@/lib/utils";

type Transform = { scale: number; x: number; y: number };

const TARGET_ZOOM_SCALE = 2.4;

export interface FloorMapViewerProps {
  name: string;
  hall?: string | null;
  imageUrl?: string | null;
  width?: number;
  height?: number;
  markers: CircleMarker[];
  initialCircleId?: string;
  halls?: Array<{ id: string; name: string; hall?: string | null }>;
  currentHallId?: string;
  onSelectHall?: (id: string) => void;
}

export function FloorMapViewer({
  name,
  hall,
  imageUrl,
  width = 1400,
  height = 900,
  markers,
  initialCircleId,
  halls,
  currentHallId,
  onSelectHall
}: FloorMapViewerProps) {
  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [selectedCircleId, setSelectedCircleId] = useState<string | undefined>(initialCircleId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dayFilter, setDayFilter] = useState<"ALL" | "DAY_1" | "DAY_2" | "WISHLIST">("ALL");
  const [selectedFandom, setSelectedFandom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"vector" | "image">("vector");
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });

  // Sinkronisasi Reaktif Wishlist (Local Storage)
  const wishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  // Touch & Pointer Gesture Tracking
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{
    mode: "none" | "pan" | "pinch";
    startTransform: Transform;
    startMidpoint: { x: number; y: number };
    startDistance: number;
  }>({
    mode: "none",
    startTransform: { scale: 1, x: 0, y: 0 },
    startMidpoint: { x: 0, y: 0 },
    startDistance: 0
  });

  // ---------------------------------------------------------------------------
  // FILTERING & PENCARIAN
  // ---------------------------------------------------------------------------
  const { filtered: displayedMarkers, matchedIds } = useMemo(() => {
    return filterCircleMarkers(markers, {
      search: searchQuery,
      dayFilter,
      fandom: selectedFandom ?? undefined,
      wishlistIds: wishlistSet
    });
  }, [markers, searchQuery, dayFilter, selectedFandom, wishlistSet]);

  const activeMarker = useMemo(() => {
    if (!selectedCircleId) return null;
    return markers.find((m) => m.circleId === selectedCircleId || m.id === selectedCircleId) ?? null;
  }, [markers, selectedCircleId]);

  // Jumlah booth di wishlist untuk hall ini
  const hallWishlistCount = useMemo(() => {
    return markers.filter((m) =>
      isCircleInWishlist(m.circleId, m.products.map((p) => p.id), wishlistSet)
    ).length;
  }, [markers, wishlistSet]);

  // Autocomplete search suggestions (max 6 items)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return displayedMarkers.slice(0, 6);
  }, [displayedMarkers, searchQuery]);

  // ---------------------------------------------------------------------------
  // AUTO-PAN / FOCUS MARKER
  // ---------------------------------------------------------------------------
  const focusMarker = useCallback(
    (marker: CircleMarker, scale = TARGET_ZOOM_SCALE) => {
      setSelectedCircleId(marker.circleId);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const localX = (marker.posX / 100) * rect.width;
      const localY = (marker.posY / 100) * rect.height;
      const nextX = rect.width / 2 - scale * localX;
      const nextY = rect.height / 2 - scale * localY;

      const minX = rect.width * (1 - scale);
      const minY = rect.height * (1 - scale);

      setTransform({
        scale,
        x: Math.min(0, Math.max(minX, nextX)),
        y: Math.min(0, Math.max(minY, nextY))
      });
    },
    []
  );

  // Jika initialCircleId diberikan dari URL, auto fokus saat pertama kali mount
  useEffect(() => {
    if (initialCircleId) {
      const target = markers.find(
        (m) => m.circleId === initialCircleId || m.id === initialCircleId
      );
      if (target) {
        focusMarker(target);
      }
    }
  }, [initialCircleId, markers, focusMarker]);

  // ---------------------------------------------------------------------------
  // POINTER & GESTURE HANDLERS (PAN & PINCH-ZOOM)
  // ---------------------------------------------------------------------------
  const clampTranslate = useCallback((next: Transform, rect: { width: number; height: number }) => {
    const minX = rect.width * (1 - next.scale);
    const minY = rect.height * (1 - next.scale);
    return {
      scale: next.scale,
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y))
    };
  }, []);

  function relativePoint(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    // Abaikan jika klik terjadi pada form input/button kontrol
    if ((event.target as HTMLElement).closest("input, button, a")) return;

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
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      gestureRef.current = {
        mode: "pinch",
        startTransform: transform,
        startMidpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        startDistance: dist
      };
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const gesture = gestureRef.current;

    if (gesture.mode === "pan" && pointers.current.size === 1) {
      if (transform.scale <= FLOOR_MAP_MIN_SCALE) return;
      const current = relativePoint(event.clientX, event.clientY);
      const dx = current.x - gesture.startMidpoint.x;
      const dy = current.y - gesture.startMidpoint.y;
      setTransform(
        clampTranslate(
          {
            scale: gesture.startTransform.scale,
            x: gesture.startTransform.x + dx,
            y: gesture.startTransform.y + dy
          },
          rect
        )
      );
    } else if (gesture.mode === "pinch" && pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const scaleRatio = distance / (gesture.startDistance || distance);
      const nextScale = clampScale(gesture.startTransform.scale * scaleRatio);
      const { translateX, translateY } = computeFocalTranslate({
        focalX: mid.x,
        focalY: mid.y,
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
    if (!rect) return;
    const focal = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const delta = event.deltaY > 0 ? -0.2 : 0.2;
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
    if (!rect) return;
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

  // Tombol "Next booth" untuk berburu di venue
  function goToNextBooth() {
    const candidates = markers.map((m) => ({
      id: m.id,
      boothCode: m.boothCode,
      isDone: m.isDone,
      isHighlighted: m.isHighlighted
    }));

    const nextCandidate = pickNextBooth(candidates, activeMarker?.id);
    if (!nextCandidate) return;

    const matched = markers.find((m) => m.id === nextCandidate.id);
    if (matched) {
      focusMarker(matched);
    }
  }

  const effectiveHall = hall || (name.toLowerCase().includes("9") ? "Hall 9" : "Hall 8");

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* 1. VENUE HALL SWITCHER (HALL 8 VS HALL 9)                           */}
      {/* =================================================================== */}
      {halls && halls.length > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card/90 p-3 sm:p-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#5398DA]" />
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Pilih Hall Venue:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {halls.map((h) => {
              const isActive = (currentHallId && h.id === currentHallId) || h.name === name;
              const isH8 = (h.hall || h.name).includes("8");
              return onSelectHall ? (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onSelectHall(h.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-sm border",
                    isActive
                      ? "bg-[#111215] text-[#D6F834] border-[#D6F834] shadow-md ring-2 ring-[#D6F834]/30"
                      : "bg-white text-ink-700 border-line hover:border-[#5398DA] hover:text-[#5398DA]"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isH8 ? "bg-[#5398DA]" : "bg-[#D6F834]"
                    )}
                  />
                  {h.hall ? `${h.hall} · ${h.name.replace(/Hall\s*\d+\s*-?\s*/i, "")}` : h.name}
                </button>
              ) : (
                <Link
                  key={h.id}
                  href={`/maps/${h.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-sm border",
                    isActive
                      ? "bg-[#111215] text-[#D6F834] border-[#D6F834] shadow-md ring-2 ring-[#D6F834]/30"
                      : "bg-white text-ink-700 border-line hover:border-[#5398DA] hover:text-[#5398DA]"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isH8 ? "bg-[#5398DA]" : "bg-[#D6F834]"
                    )}
                  />
                  {h.hall ? `${h.hall} · ${h.name.replace(/Hall\s*\d+\s*-?\s*/i, "")}` : h.name}
                </Link>
              );
            })}
          </div>

          {/* Toggle View Mode (Bila tersedia foto gambar floor map) */}
          {imageUrl ? (
            <div className="flex items-center gap-1 rounded-full border border-line bg-muted/60 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("vector")}
                className={cn(
                  "rounded-full px-3 py-1 font-semibold transition",
                  viewMode === "vector"
                    ? "bg-white text-ink-900 shadow-xs"
                    : "text-ink-500 hover:text-ink-900"
                )}
              >
                Denah Vektor
              </button>
              <button
                type="button"
                onClick={() => setViewMode("image")}
                className={cn(
                  "rounded-full px-3 py-1 font-semibold transition",
                  viewMode === "image"
                    ? "bg-white text-ink-900 shadow-xs"
                    : "text-ink-500 hover:text-ink-900"
                )}
              >
                Foto Asli
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* 2. INTERACTIVE CANVAS CONTAINER                                     */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-[#111215] shadow-2xl">
        {/* ----------------------------------------------------------------- */}
        {/* FLOATING TOP BAR: PENCARIAN & FILTER CHIPS                        */}
        {/* ----------------------------------------------------------------- */}
        <div className="absolute inset-x-0 top-0 z-20 p-3 sm:p-4 space-y-2 pointer-events-none">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 max-w-3xl pointer-events-auto">
            {/* Search Input Mengambang */}
            <div className="relative flex-1">
              <div className="flex items-center rounded-2xl border border-white/20 bg-[#161922]/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition focus-within:border-[#D6F834] focus-within:ring-2 focus-within:ring-[#D6F834]/30">
                <Search className="h-4 w-4 text-[#D6F834] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Cari circle, booth (AA-01, TC-12), atau fandom..."
                  className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-hidden"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchFocused(false);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>

              {/* Autocomplete Dropdown Hasil Pencarian */}
              {isSearchFocused && searchSuggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-white/20 bg-[#161922]/95 p-2 shadow-2xl backdrop-blur-xl z-30">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    {displayedMarkers.length} Booth Ditemukan
                  </p>
                  <div className="space-y-1">
                    {searchSuggestions.map((m) => (
                      <button
                        key={`sugg-${m.id}`}
                        type="button"
                        onClick={() => {
                          focusMarker(m);
                          setIsSearchFocused(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-white/10"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{m.circleName}</p>
                          {m.fandom ? (
                            <p className="text-[11px] text-[#D6F834]">{m.fandom}</p>
                          ) : null}
                        </div>
                        <span className="rounded-lg bg-[#D6F834] px-2 py-0.5 font-[var(--font-mono)] text-[11px] font-extrabold text-[#111215]">
                          {m.boothCode}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Quick Fandom Clear Pill (bila aktif) */}
            {selectedFandom ? (
              <button
                type="button"
                onClick={() => setSelectedFandom(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#D6F834] px-3 py-1.5 text-xs font-bold text-[#111215] shadow-lg"
              >
                <span>Fandom: {selectedFandom}</span>
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          {/* Filter Chips Bar (Semua Meja, Day 1, Day 2, Wishlist) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setDayFilter("ALL")}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-md backdrop-blur border",
                dayFilter === "ALL"
                  ? "bg-white text-[#111215] border-white shadow-lg"
                  : "bg-[#141720]/80 text-white/80 border-white/15 hover:bg-white/20"
              )}
            >
              Semua Meja ({markers.length})
            </button>

            <button
              type="button"
              onClick={() => setDayFilter("DAY_1")}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-md backdrop-blur border",
                dayFilter === "DAY_1"
                  ? "bg-[#5398DA] text-white border-[#5398DA] shadow-lg shadow-[#5398DA]/30"
                  : "bg-[#141720]/80 text-white/80 border-white/15 hover:bg-[#5398DA]/20"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-[#5398DA]" />
              Day 1 (Sabtu)
            </button>

            <button
              type="button"
              onClick={() => setDayFilter("DAY_2")}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-md backdrop-blur border",
                dayFilter === "DAY_2"
                  ? "bg-[#D6F834] text-[#111215] border-[#D6F834] shadow-lg shadow-[#D6F834]/30"
                  : "bg-[#141720]/80 text-white/80 border-white/15 hover:bg-[#D6F834]/20"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-[#D6F834]" />
              Day 2 (Minggu)
            </button>

            <button
              type="button"
              onClick={() => setDayFilter("WISHLIST")}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-md backdrop-blur border",
                dayFilter === "WISHLIST"
                  ? "bg-[#FF4838] text-white border-[#FF4838] shadow-lg shadow-[#FF4838]/30"
                  : "bg-[#141720]/80 text-white/80 border-white/15 hover:bg-[#FF4838]/20"
              )}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5",
                  dayFilter === "WISHLIST" ? "fill-white" : "text-[#FF4838]"
                )}
              />
              ♥ Tersimpan ({hallWishlistCount})
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* FLOATING CONTROLS (KANAN BAWAH PETA)                              */}
        {/* ----------------------------------------------------------------- */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-[#141720]/90 p-1.5 shadow-xl backdrop-blur-md pointer-events-auto">
            <button
              type="button"
              onClick={() => zoomBy(-0.5)}
              aria-label="Perkecil denah"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-9 text-center font-[var(--font-mono)] text-xs font-bold text-white/60">
              {Math.round(transform.scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoomBy(0.5)}
              aria-label="Perbesar denah"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-white/20" />
            <button
              type="button"
              onClick={resetZoom}
              aria-label="Reset zoom"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={goToNextBooth}
            className="flex items-center gap-2 rounded-2xl bg-[#D6F834] px-4 py-3 text-xs sm:text-sm font-extrabold text-[#111215] shadow-xl hover:bg-[#c6e926] transition active:scale-95 pointer-events-auto"
          >
            <Navigation className="h-4 w-4" />
            Booth Berikutnya
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* INTERACTIVE ZOOMABLE MAP VIEWPORT                                */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={containerRef}
          className="relative touch-none select-none overflow-hidden bg-[#111215] cursor-grab active:cursor-grabbing"
          style={{ aspectRatio: `${width}/${height}`, minHeight: "520px" }}
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
              transition: gestureRef.current.mode === "none" ? "transform 140ms cubic-bezier(0.16, 1, 0.3, 1)" : "none"
            }}
          >
            {/* Latar Belakang Denah: Vektor SVG Arsitektural atau Foto Asli */}
            {viewMode === "image" && imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                unoptimized
                className="object-cover"
                draggable={false}
              />
            ) : (
              <IceHallCanvas hall={effectiveHall} />
            )}

            {/* =============================================================== */}
            {/* BOOTH MARKERS LAYER                                             */}
            {/* =============================================================== */}
            {markers.map((marker) => {
              const isSelected = marker.circleId === selectedCircleId || marker.id === selectedCircleId;
              const isWish = isCircleInWishlist(
                marker.circleId,
                marker.products.map((p) => p.id),
                wishlistSet
              );
              const isMatchedByFilter = matchedIds.has(marker.id);
              const isSearching = searchQuery.trim().length > 0;
              const isDimmed = !isMatchedByFilter;

              // Warna indikator hari TANALOKA
              const dayColor =
                marker.day === "DAY_1"
                  ? "bg-[#5398DA]" // Sky Blue
                  : marker.day === "DAY_2"
                    ? "bg-[#D6F834] text-[#111215]" // Acid Lime
                    : "bg-[#FF4838]"; // Coral Red

              return (
                <button
                  key={marker.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusMarker(marker);
                  }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group focus:outline-hidden",
                    // Dimmed saat tidak cocok dengan filter aktif
                    isDimmed ? "opacity-20 pointer-events-none scale-75" : "opacity-100",
                    // Z-index prioritas
                    isSelected ? "z-30 scale-150" : isMatchedByFilter && isSearching ? "z-20 scale-125" : "z-10"
                  )}
                  style={{ left: `${marker.posX}%`, top: `${marker.posY}%` }}
                  aria-label={`${marker.circleName} (Booth ${marker.boothCode})`}
                >
                  {/* Titik Marker / Dot */}
                  <div
                    className={cn(
                      "relative flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 border-white shadow-md transition",
                      dayColor,
                      isSelected && "ring-4 ring-[#D6F834] shadow-xl animate-bounce",
                      isMatchedByFilter && isSearching && !isSelected && "ring-4 ring-[#D6F834]/70 animate-pulse",
                      marker.hasRush && "ring-2 ring-rose-400"
                    )}
                  >
                    {/* Ikon Bookmark / Heart jika tersimpan di Wishlist */}
                    {isWish ? (
                      <div className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF4838] text-white shadow-xs">
                        <Heart className="h-2 w-2 fill-white" />
                      </div>
                    ) : null}

                    {/* Titik pusat bila normal */}
                    <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                  </div>

                  {/* Label Kode Meja Mengambang saat Zoom Mendekat atau Hover */}
                  {(transform.scale >= 1.6 || isSelected) && (
                    <div
                      className={cn(
                        "absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5",
                        "font-[var(--font-mono)] text-[10px] font-extrabold shadow-md pointer-events-none transition",
                        isSelected
                          ? "bg-[#D6F834] text-[#111215] ring-1 ring-black"
                          : "bg-[#141720]/90 text-white/95 border border-white/20"
                      )}
                    >
                      {marker.boothCode}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* BOTTOM HELPER GUIDE TEXT                                          */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0E1017] px-4 py-2.5 text-[11px] text-white/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#5398DA]" /> Day 1 (Sabtu)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D6F834]" /> Day 2 (Minggu)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF4838]" /> Both Days
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-2.5 w-2.5 fill-[#FF4838] text-[#FF4838]" /> Tersimpan
            </span>
          </div>
          <p className="hidden sm:block">
            Cubit dua jari di layar HP atau scroll mouse untuk zoom • Geser untuk navigasi denah
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* CIRCLE DETAIL DRAWER / SHEET COMPONENT                            */}
        {/* ----------------------------------------------------------------- */}
        <CircleDetailSheet
          marker={activeMarker}
          onClose={() => setSelectedCircleId(undefined)}
          floorMapName={name}
        />
      </div>
    </div>
  );
}
