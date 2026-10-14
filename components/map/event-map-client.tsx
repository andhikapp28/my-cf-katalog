"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  X,
  Heart,
  Info
} from "lucide-react";
import type {
  HallDefinition,
  CommunityZone,
  CircleMarker
} from "@/lib/floor-map";
import { CircleDrawer } from "@/components/map/circle-drawer";
import { MapControls } from "@/components/map/map-controls";
import { getWishlistProductIds, toggleWishlist } from "@/lib/wishlist";

const getWishlist = getWishlistProductIds;

interface EventMapClientProps {
  initialEvent: {
    id: string;
    name: string;
    slug: string;
    venue: string;
    datesText: string;
    editionNumber: number;
    hallsText: string;
  };
  initialHalls: HallDefinition[];
  initialZones: CommunityZone[];
  archiveMarkers: CircleMarker[];
  isCf23: boolean;
  statusNotice?: string;
}

type DayFilter = "ALL" | "DAY_1" | "DAY_2" | "WISHLIST";
type ViewMode = "official_cf23" | "archive_cf22";

export function EventMapClient({
  initialEvent,
  initialHalls,
  initialZones,
  archiveMarkers,
  isCf23,
  statusNotice
}: EventMapClientProps) {
  // Mode: Default to official CF 23 layout if CF 23, otherwise CF 22 archive
  const [viewMode, setViewMode] = useState<ViewMode>(
    isCf23 ? "official_cf23" : "archive_cf22"
  );

  // Filters
  const [dayFilter, setDayFilter] = useState<DayFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);

  // Wishlist state (local storage backed)
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Selection / Drawer state
  const [selectedMarker, setSelectedMarker] = useState<CircleMarker | null>(null);
  const [selectedZone, setSelectedZone] = useState<CommunityZone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Viewport Pan-Zoom state
  const [scale, setScale] = useState(1.0);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  // Load wishlist on client
  useEffect(() => {
    setWishlistIds(getWishlistProductIds());

    const handleWishlistUpdate = () => {
      setWishlistIds(getWishlistProductIds());
    };

    window.addEventListener("comipocket:wishlist-updated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("comipocket:wishlist-updated", handleWishlistUpdate);
    };
  }, []);

  // Handle Wishlist Toggle
  const handleToggleWishlist = useCallback((id: string, _name?: string) => {
    toggleWishlist(id);
    const updated = getWishlist();
    setWishlistIds(updated);
  }, []);

  // Filtered Archive Markers (for CF 22 archive view)
  const filteredArchiveMarkers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return archiveMarkers.filter((m) => {
      // Day filter
      if (dayFilter === "DAY_1" && m.day === "DAY_2") return false;
      if (dayFilter === "DAY_2" && m.day === "DAY_1") return false;
      if (dayFilter === "WISHLIST") {
        const entityId = m.circleId || m.id;
        if (!wishlistIds.includes(entityId) && !wishlistIds.includes(m.id)) {
          return false;
        }
      }

      // Hall filter
      if (selectedHallId) {
        const hallNum = selectedHallId.replace("hall-", "");
        if (!m.hall?.includes(hallNum)) return false;
      }

      // Search Query
      if (q) {
        const matchCode = m.boothCode.toLowerCase().includes(q);
        const matchName = m.circleName.toLowerCase().includes(q);
        const matchFandom = m.fandom?.toLowerCase().includes(q) ?? false;
        const matchHall = m.hall?.toLowerCase().includes(q) ?? false;
        return matchCode || matchName || matchFandom || matchHall;
      }

      return true;
    });
  }, [archiveMarkers, dayFilter, searchQuery, selectedHallId, wishlistIds]);

  // Filtered Community Zones (for CF 23 official view)
  const filteredZones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return initialZones.filter((z) => {
      // Hall filter
      if (selectedHallId) {
        const hallNum = selectedHallId.replace("hall-", "");
        if (!z.hall.includes(hallNum)) return false;
      }

      // Search Query
      if (q) {
        const matchCode = z.code.toLowerCase().includes(q);
        const matchName = z.name.toLowerCase().includes(q);
        const matchDesc = z.description.toLowerCase().includes(q);
        const matchHall = z.hall.toLowerCase().includes(q);
        const matchTags = z.tags.some((t) => t.toLowerCase().includes(q));
        return matchCode || matchName || matchDesc || matchHall || matchTags;
      }

      return true;
    });
  }, [initialZones, searchQuery, selectedHallId]);

  // Total results count
  const matchCount = viewMode === "archive_cf22" ? filteredArchiveMarkers.length : filteredZones.length;

  // Zoom In / Out / Reset
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3.5, Number((prev + 0.3).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.65, Number((prev - 0.3).toFixed(2))));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(1.0);
    setTranslate({ x: 0, y: 0 });
    setSelectedHallId(null);
  }, []);

  // Center / Focus on specific Hall
  const handleFocusHall = useCallback((hallId: string | null) => {
    if (!hallId) {
      handleResetView();
      return;
    }

    setSelectedHallId(hallId);
    const hall = initialHalls.find((h) => h.id === hallId);
    if (!hall) return;

    // SVG coordinate space: 2400 x 1200
    // Center of this hall in SVG canvas:
    const hallCenterX = hall.x + hall.width / 2;
    const hallCenterY = hall.y + hall.height / 2;

    const targetScale = 2.2;
    // Map center is 1200, 600
    const nextTx = (1200 - hallCenterX) * (targetScale * 0.45);
    const nextTy = (550 - hallCenterY) * (targetScale * 0.45);

    setScale(targetScale);
    setTranslate({ x: Number(nextTx.toFixed(0)), y: Number(nextTy.toFixed(0)) });
  }, [initialHalls, handleResetView]);

  // Pointer Drag Handlers (Mouse / Touch pan)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return; // Primary button only
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setScale((prev) => {
      const next = Math.min(3.5, Math.max(0.65, prev + zoomDelta));
      return Number(next.toFixed(2));
    });
  };

  // Touch Pinch-to-Zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / touchDistanceRef.current;
      touchDistanceRef.current = dist;

      setScale((prev) => {
        const next = Math.min(3.5, Math.max(0.65, prev * ratio));
        return Number(next.toFixed(2));
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  // Click on Marker
  const handleMarkerClick = (marker: CircleMarker) => {
    setSelectedMarker(marker);
    setSelectedZone(null);
    setIsDrawerOpen(true);
  };

  // Click on Zone
  const handleZoneClick = (zone: CommunityZone) => {
    setSelectedZone(zone);
    setSelectedMarker(null);
    setIsDrawerOpen(true);
  };

  // Check if current entity is wishlisted
  const currentEntityId = selectedMarker
    ? selectedMarker.circleId || selectedMarker.id
    : selectedZone?.id || "";

  const isCurrentWishlisted =
    wishlistIds.includes(currentEntityId) ||
    (selectedMarker ? wishlistIds.includes(selectedMarker.id) : false);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-950 text-white selection:bg-[#D6F834] selection:text-zinc-950">
      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex flex-col gap-3 max-w-7xl">
          {/* Top Row: Back button, Title & Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href={`/events/${initialEvent.slug}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
                aria-label="Kembali ke detail event"
                title="Kembali ke Detail Event"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#D6F834] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-zinc-950">
                    EDISI {initialEvent.editionNumber}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    ICE BSD (Hall 5 - 10)
                  </span>
                </div>
                <h1 className="font-[var(--font-display)] text-base sm:text-lg font-black uppercase tracking-tight text-white leading-tight truncate max-w-[280px] sm:max-w-md">
                  {initialEvent.name}
                </h1>
              </div>
            </div>

            {/* Mode Switcher Toggle: Official CF 23 vs CF 22 Archive */}
            <div className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setViewMode("official_cf23")}
                className={`min-h-[36px] rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  viewMode === "official_cf23"
                    ? "bg-[#D6F834] text-zinc-950 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Denah CF 23
              </button>

              <button
                type="button"
                onClick={() => setViewMode("archive_cf22")}
                className={`min-h-[36px] rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  viewMode === "archive_cf22"
                    ? "bg-[#D6F834] text-zinc-950 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Arsip CF 22 (1.478 Stan)
              </button>
            </div>
          </div>

          {/* Bottom Row: Day Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Day Filter Chips */}
            <div
              role="group"
              aria-label="Filter Hari Kehadiran"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
            >
              <button
                type="button"
                onClick={() => setDayFilter("ALL")}
                className={`min-h-[44px] rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  dayFilter === "ALL"
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                Semua Hari
              </button>

              <button
                type="button"
                onClick={() => setDayFilter("DAY_1")}
                className={`min-h-[44px] rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  dayFilter === "DAY_1"
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                Day 1 (Sabtu)
              </button>

              <button
                type="button"
                onClick={() => setDayFilter("DAY_2")}
                className={`min-h-[44px] rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  dayFilter === "DAY_2"
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                Day 2 (Minggu)
              </button>

              <button
                type="button"
                onClick={() => setDayFilter("WISHLIST")}
                className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  dayFilter === "WISHLIST"
                    ? "bg-[#D6F834] text-zinc-950 shadow-xs font-black"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${dayFilter === "WISHLIST" ? "fill-zinc-950" : ""}`} />
                <span>Wishlist ({wishlistIds.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  viewMode === "archive_cf22"
                    ? "Cari AA-01, TC-12, nama circle..."
                    : "Cari FC-01, Stage, Shuttle, stan..."
                }
                className="min-h-[44px] w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-10 text-xs font-medium text-white placeholder:text-zinc-500 focus:border-[#D6F834] focus:outline-none focus:ring-1 focus:ring-[#D6F834]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Announcement Banner (Status pending CF 23 / Arsip CF 22 notice) */}
      <div className="bg-zinc-900 border-b border-white/10 px-4 py-2.5 text-xs text-zinc-300">
        <div className="mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-7xl">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[#D6F834] shrink-0" />
            <span>
              {viewMode === "official_cf23"
                ? statusNotice ||
                  "Denah Venue CF 23 (Hall 5-10) — Penempatan meja booth 1.959 circle sedang menunggu rilis resmi panitia."
                : "Menampilkan Arsip Denah CF 22 (1.478 Stan Kreator) untuk uji coba navigasi interaktif, penanda hari, dan wishlist."}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {searchQuery && (
              <span className="font-mono text-[11px] text-[#D6F834] font-bold">
                {matchCount} lokasi ditemukan
              </span>
            )}

            {viewMode === "official_cf23" ? (
              <button
                type="button"
                onClick={() => setViewMode("archive_cf22")}
                className="font-mono text-[11px] font-bold text-[#D6F834] hover:underline underline-offset-4"
              >
                Lihat Arsip Denah CF 22 &rarr;
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode("official_cf23")}
                className="font-mono text-[11px] font-bold text-[#D6F834] hover:underline underline-offset-4"
              >
                Kembali ke Denah Resmi CF 23 &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Hall Quick-Jump Nav Bar */}
      <div className="border-b border-white/10 bg-zinc-950/80 px-4 py-2">
        <div className="mx-auto flex items-center gap-1.5 overflow-x-auto max-w-7xl scrollbar-none">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mr-2 shrink-0 hidden sm:inline">
            Fokus Hall:
          </span>

          <button
            type="button"
            onClick={() => handleFocusHall(null)}
            className={`min-h-[44px] rounded-lg px-3 py-1 font-mono text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              selectedHallId === null
                ? "bg-white text-zinc-950"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            Semua Hall (5-10)
          </button>

          {initialHalls.map((h) => {
            const isSelected = selectedHallId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => handleFocusHall(isSelected ? null : h.id)}
                className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isSelected
                    ? "bg-[#D6F834] text-zinc-950 shadow-xs font-black"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{h.name}</span>
                <span className="text-[10px] opacity-70 font-normal">
                  ({h.title.split(" ")[0]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive SVG Map Canvas Viewport */}
      <main
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 overflow-hidden select-none bg-zinc-950 cursor-grab active:cursor-grabbing ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        aria-label="Area Peta Interaktif ICE BSD City"
      >
        {/* Subtle Grid Pattern Background */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* SVG Floor Map Plane */}
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "50% 50%",
            transition: isDragging ? "none" : "transform 150ms ease-out"
          }}
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
        >
          <svg
            viewBox="0 0 2400 1200"
            className="w-full max-w-[2400px] h-auto drop-shadow-2xl"
            style={{ minWidth: "1200px" }}
          >
            {/* Outer Venue Perimeter */}
            <rect
              x="40"
              y="30"
              width="2320"
              height="1140"
              rx="24"
              fill="#0B0F19"
              stroke="#1E293B"
              strokeWidth="4"
            />

            {/* Concourse / Lobby Walkway at Bottom */}
            <rect
              x="60"
              y="920"
              width="2260"
              height="150"
              rx="16"
              fill="#111827"
              stroke="#334155"
              strokeWidth="2"
            />
            <text
              x="1190"
              y="1005"
              fill="#64748B"
              fontSize="24"
              fontFamily="var(--font-mono, monospace)"
              fontWeight="bold"
              letterSpacing="6"
              textAnchor="middle"
            >
              KORIDOR LOBBY &amp; CONCOURSE UTAMA ICE BSD CITY
            </text>

            {/* Shuttle Lorena Bus Terminal at Hall 10 */}
            <g
              onClick={() => {
                const shuttleZone = initialZones.find((z) => z.code === "SHUTTLE-H10");
                if (shuttleZone) handleZoneClick(shuttleZone);
              }}
              className="cursor-pointer group"
            >
              <rect
                x="1960"
                y="1085"
                width="360"
                height="70"
                rx="12"
                fill="#064E3B"
                stroke="#10B981"
                strokeWidth="2"
                className="transition-colors group-hover:fill-[#047857]"
              />
              <text
                x="2140"
                y="1127"
                fill="#A7F3D0"
                fontSize="16"
                fontFamily="var(--font-mono, monospace)"
                fontWeight="bold"
                textAnchor="middle"
              >
                HALTE SHUTTLE BUS LORENA (ST. CISAUK)
              </text>
            </g>

            {/* Entrance Gates along concourse */}
            <g fill="#475569" fontSize="13" fontFamily="monospace">
              <text x="240" y="945" textAnchor="middle">
                GATE HALL 5-6
              </text>
              <line x1="240" y1="910" x2="240" y2="920" stroke="#10B981" strokeWidth="4" />

              <text x="1000" y="945" textAnchor="middle">
                GATE HALL 7-8
              </text>
              <line x1="1000" y1="910" x2="1000" y2="920" stroke="#38BDF8" strokeWidth="4" />

              <text x="1760" y="945" textAnchor="middle">
                MAIN GATE (WRISTBAND CHECK)
              </text>
              <line x1="1760" y1="910" x2="1760" y2="920" stroke="#D6F834" strokeWidth="4" />
            </g>

            {/* 6 Major Halls (Hall 5, 6, 7, 8, 9, 10) */}
            {initialHalls.map((hall) => {
              const isSelected = selectedHallId === hall.id;
              return (
                <g key={hall.id}>
                  {/* Hall Background Shell */}
                  <rect
                    x={hall.x}
                    y={hall.y}
                    width={hall.width}
                    height={hall.height}
                    rx="16"
                    fill={isSelected ? "#131C2E" : "#0F172A"}
                    stroke={isSelected ? "#D6F834" : "#1E293B"}
                    strokeWidth={isSelected ? 4 : 2}
                    className="transition-colors"
                  />

                  {/* Hall Header Strip */}
                  <rect
                    x={hall.x}
                    y={hall.y}
                    width={hall.width}
                    height="70"
                    rx="16"
                    fill={hall.themeColor}
                    opacity="0.85"
                  />
                  {/* Rect bottom fix for rounded corners */}
                  <rect
                    x={hall.x}
                    y={hall.y + 45}
                    width={hall.width}
                    height="25"
                    fill={hall.themeColor}
                    opacity="0.85"
                  />

                  {/* Hall Title Text */}
                  <text
                    x={hall.x + hall.width / 2}
                    y={hall.y + 34}
                    fill="#FFFFFF"
                    fontSize="22"
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight="900"
                    letterSpacing="2"
                    textAnchor="middle"
                  >
                    {hall.name}
                  </text>
                  <text
                    x={hall.x + hall.width / 2}
                    y={hall.y + 56}
                    fill="#E2E8F0"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {hall.title}
                  </text>
                </g>
              );
            })}

            {/* Official CF 23 Mode: Render Structured Community & Facility Zones */}
            {viewMode === "official_cf23" && (
              <g>
                {filteredZones.map((zone) => {
                  const isZoneSelected = selectedZone?.id === zone.id;
                  const isWish = wishlistIds.includes(zone.id);

                  // Colors by category
                  let fill = "#1E293B";
                  let stroke = "#334155";
                  if (zone.category === "STAGE") {
                    fill = "#7F1D1D";
                    stroke = "#EF4444";
                  } else if (zone.category === "FOOD") {
                    fill = "#78350F";
                    stroke = "#F59E0B";
                  } else if (zone.category === "COMMUNITY") {
                    fill = "#064E3B";
                    stroke = "#10B981";
                  } else if (zone.category === "CORPORATE") {
                    fill = "#1E3A8A";
                    stroke = "#3B82F6";
                  } else if (zone.category === "TICKET") {
                    fill = "#134E4A";
                    stroke = "#14B8A6";
                  }

                  if (isZoneSelected) {
                    stroke = "#D6F834";
                  }

                  return (
                    <g
                      key={zone.id}
                      onClick={() => handleZoneClick(zone)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x={zone.masterX}
                        y={zone.masterY}
                        width={zone.width}
                        height={zone.height}
                        rx="10"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isZoneSelected ? 3 : 1.5}
                        className="transition-all group-hover:opacity-90"
                      />

                      {/* Code Badge */}
                      <text
                        x={zone.masterX + 12}
                        y={zone.masterY + 22}
                        fill={isWish ? "#D6F834" : "#94A3B8"}
                        fontSize="11"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="bold"
                      >
                        {zone.code}
                      </text>

                      {/* Zone Name */}
                      <text
                        x={zone.masterX + 12}
                        y={zone.masterY + 40}
                        fill="#FFFFFF"
                        fontSize="13"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        {zone.name.length > 32 ? `${zone.name.slice(0, 30)}...` : zone.name}
                      </text>

                      {/* Tag preview */}
                      {zone.tags[0] && (
                        <text
                          x={zone.masterX + 12}
                          y={zone.masterY + 58}
                          fill="#CBD5E1"
                          fontSize="10"
                          fontFamily="sans-serif"
                        >
                          {zone.tags[0]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* CF 22 Archive Mode: Render 1,478 Interactive Circle Markers */}
            {viewMode === "archive_cf22" && (
              <g>
                {filteredArchiveMarkers.map((marker) => {
                  const mX = marker.masterX ?? 1250;
                  const mY = marker.masterY ?? 300;
                  const isSelected = selectedMarker?.id === marker.id;
                  const isWish =
                    wishlistIds.includes(marker.circleId) ||
                    wishlistIds.includes(marker.id);

                  // Marker Color styling
                  let fill = "#64748B";
                  let radius = 6;
                  if (isWish) {
                    fill = "#D6F834";
                    radius = 9;
                  } else if (isSelected) {
                    fill = "#F84632";
                    radius = 10;
                  } else if (marker.rating === "M") {
                    fill = "#FB7185";
                  } else if (marker.boothCode.startsWith("TC-")) {
                    fill = "#38BDF8";
                    radius = 8;
                  }

                  return (
                    <g
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse halo if selected or wishlisted */}
                      {(isSelected || isWish) && (
                        <circle
                          cx={mX}
                          cy={mY}
                          r={radius + 5}
                          fill={isWish ? "#D6F834" : "#F84632"}
                          opacity="0.3"
                        />
                      )}

                      <circle
                        cx={mX}
                        cy={mY}
                        r={radius}
                        fill={fill}
                        stroke="#0F172A"
                        strokeWidth="2"
                        className="transition-transform group-hover:scale-125"
                      />

                      {/* Monospace Code label (visible at higher zoom) */}
                      {scale >= 1.5 && (
                        <text
                          x={mX + 9}
                          y={mY + 4}
                          fill={isWish ? "#D6F834" : "#F1F5F9"}
                          fontSize="9"
                          fontFamily="var(--font-mono, monospace)"
                          fontWeight="bold"
                        >
                          {marker.boothCode}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        {/* 5. Floating Navigation Controls Toolbar */}
        <div className="absolute bottom-6 left-6 z-20">
          <MapControls
            scale={scale}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleResetView}
          />
        </div>

        {/* 6. Context-Preserving Slide-up Drawer / Side Panel */}
        <CircleDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          selectedMarker={selectedMarker}
          selectedZone={selectedZone}
          isWishlisted={isCurrentWishlisted}
          onToggleWishlist={handleToggleWishlist}
        />
      </main>
    </div>
  );
}
