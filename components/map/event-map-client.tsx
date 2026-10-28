"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Filter,
  Printer,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  type BoothPosition,
  type RawCircleEntry
} from "./leaflet-map-canvas";
import { MapSidebar } from "./map-sidebar";
import { CircleExplorer } from "./circle-explorer";
import { CircleDrawer } from "./circle-drawer";
import { WishlistMapExportModal } from "./wishlist-map-export-modal";
import {
  getWishlistSnapshot,
  toggleWishlist,
  subscribeWishlist
} from "@/lib/wishlist";
import { detectBoothHall } from "@/lib/floor-map";
import type { EventMapPageData } from "@/lib/map-data";

// Dynamically import LeafletMapCanvas to guarantee zero SSR hydration mismatch
const LeafletMapCanvas = dynamic(
  () => import("./leaflet-map-canvas"),
  { ssr: false }
);

export interface EventMapClientProps {
  initialEvent?: EventMapPageData["event"];
  initialHalls?: EventMapPageData["halls"];
  initialZones?: EventMapPageData["communityZones"];
  archiveMarkers?: EventMapPageData["archiveMarkers"];
  isCf23?: boolean;
  statusNotice?: string;
  initialData?: EventMapPageData;
}

// Function to expand booth codes and days matching sirkel.id pe() function
function expandCircleBooths(codeStr?: string | null, dayStr?: string | null): Array<{ code: string; day: string }> {
  if (!codeStr) return [];
  let a = codeStr.trim();
  let s: string | null = null;
  const r = a.match(/^(.+?)\s*\((?:SAT|SUN)\)$/);
  if (r) {
    a = r[1].trim();
    s = codeStr.includes("(SAT)") ? "SAT" : "SUN";
  }
  const o = s || dayStr || "Both Days";
  const n: string[] = [];
  const isTwoLetter = /^[A-Z]{2}-/.test(a);

  if (a.includes("/")) {
    a.split("/").forEach((l) => {
      const part = l.trim();
      if (isTwoLetter) {
        n.push(part);
      } else {
        const d = part.match(/^(.+?)([ab]+)$/);
        if (d) {
          const f = d[1];
          d[2].split("").forEach((c) => n.push(`${f}${c}`));
        } else {
          n.push(part);
        }
      }
    });
  } else if (isTwoLetter) {
    n.push(a);
  } else {
    const u = a.match(/^(.+?)([ab]+)$/);
    if (u) {
      const l = u[1];
      u[2].split("").forEach((c) => n.push(`${l}${c}`));
    } else {
      n.push(a);
    }
  }

  const res: Array<{ code: string; day: string }> = [];
  const upperO = o.toUpperCase();
  if (upperO.includes("BOTH") || upperO === "ALL_DAYS") {
    n.forEach((code) => {
      res.push({ code, day: "SAT" });
      res.push({ code, day: "SUN" });
    });
  } else {
    const dayMap = upperO.includes("SAT") || upperO.includes("DAY 1") || upperO.includes("DAY_1") ? "SAT" : "SUN";
    n.forEach((code) => {
      res.push({ code, day: dayMap });
    });
  }
  return res;
}

export function EventMapClient({
  initialEvent: _initialEvent,
  archiveMarkers,
  initialData
}: EventMapClientProps) {
  // Data state
  const [positions, setPositions] = useState<BoothPosition[]>([]);
  const [rawCircles, setRawCircles] = useState<RawCircleEntry[]>([]);
  const [_dataLoaded, setDataLoaded] = useState(false);

  // Filter states
  const [activeDay, setActiveDay] = useState<"SAT" | "SUN" | "ALL">("SAT");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<"ANY" | "ALL">("ANY");
  const [productFilters, setProductFilters] = useState<string[]>([]);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [explorerExpanded, setExplorerExpanded] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Selection
  const [selectedCircle, setSelectedCircle] = useState<RawCircleEntry | null>(null);
  const [selectedBoothCode, setSelectedBoothCode] = useState<string | null>(null);

  // Wishlist state synced via external store
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    setWishlistIds(getWishlistSnapshot());
    const unsubscribe = subscribeWishlist(() => {
      setWishlistIds(getWishlistSnapshot());
    });
    return unsubscribe;
  }, []);

  // Map API reference
  const mapApiRef = useRef<{
    flyToBooth: (code: string) => void;
    flyToPosition: (pos: [number, number], zoom?: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  } | null>(null);

  // Load CF23 positions and circle data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadOfficialCf23Data() {
      try {
        const [posRes, circlesRes] = await Promise.all([
          fetch("/cf23_circle_positions.json"),
          fetch("/raw_circle_data_cf23.json")
        ]);

        if (posRes.ok && circlesRes.ok) {
          const posData = await posRes.json();
          const rawJson = await circlesRes.json();
          const list = rawJson?.circle?.allCircle || rawJson?.allCircle || rawJson;

          if (isMounted) {
            setPositions(Array.isArray(posData) ? posData : []);
            setRawCircles(Array.isArray(list) ? list : []);
            setDataLoaded(true);
          }
          return;
        }
      } catch (err) {
        console.warn("Could not load CF23 official json, falling back to archive markers", err);
      }

      // Fallback to archive markers
      if (isMounted) {
        const fallbackMarkers = archiveMarkers || initialData?.archiveMarkers;
        if (fallbackMarkers && fallbackMarkers.length > 0) {
          const mappedCircles: RawCircleEntry[] = fallbackMarkers.map((m) => ({
            id: m.circleId || m.id,
            name: m.circleName,
            circle_code: m.boothCode,
            circle_cut: m.circleCutUrl,
            fandom: m.fandom,
            day: m.day === "DAY_1" ? "Day 1" : m.day === "DAY_2" ? "Day 2" : "Both Days",
            sampleworks_images: m.sampleWorks
          }));
          setRawCircles(mappedCircles);
        }
        setDataLoaded(true);
      }
    }

    loadOfficialCf23Data();

    return () => {
      isMounted = false;
    };
  }, [initialData, archiveMarkers]);

  // Index circles by `${boothCode}:${day}` and by `id`
  const { circleDataIndex, circleDataById } = useMemo(() => {
    const byCode = new Map<string, RawCircleEntry>();
    const byId = new Map<string, RawCircleEntry>();

    for (const c of rawCircles) {
      if (c.id) {
        byId.set(String(c.id), c);
      }
      const pairs = expandCircleBooths(c.circle_code, c.day);
      for (const pair of pairs) {
        const key = `${pair.code}:${pair.day}`;
        byCode.set(key, c);
      }
    }

    return { circleDataIndex: byCode, circleDataById: byId };
  }, [rawCircles]);

  // Compute matching circles for CircleExplorer
  const matchingCircles = useMemo(() => {
    const wishlistSet = new Set(wishlistIds.map(String));

    return rawCircles.filter((c) => {
      const circleIdStr = String(c.id);
      const isWishlist = wishlistSet.has(circleIdStr);

      // Wishlist Only
      if (wishlistOnly && !isWishlist) return false;

      // Day Filter
      if (activeDay !== "ALL") {
        const dayStr = (c.day || "").toUpperCase();
        if (activeDay === "SAT" && dayStr.includes("SUN") && !dayStr.includes("BOTH") && !dayStr.includes("SAT")) {
          return false;
        }
        if (activeDay === "SUN" && dayStr.includes("SAT") && !dayStr.includes("BOTH") && !dayStr.includes("SUN")) {
          return false;
        }
      }

      // Search Query Tags
      if (searchTags.length > 0) {
        const textToSearch = [
          c.circle_code || "",
          c.name || "",
          c.fandom || "",
          c.other_fandom || "",
          c.rating || ""
        ]
          .join(" ")
          .toLowerCase();

        if (matchMode === "ALL") {
          const allMatch = searchTags.every((t) =>
            textToSearch.includes(t.toLowerCase())
          );
          if (!allMatch) return false;
        } else {
          const anyMatch = searchTags.some((t) =>
            textToSearch.includes(t.toLowerCase())
          );
          if (!anyMatch) return false;
        }
      }

      // Product Category Filters
      if (productFilters.length > 0) {
        const matchesCategory = productFilters.some((f) => {
          const lower = f.toLowerCase();
          if (lower.includes("comic")) return Boolean(c.SellsComic);
          if (lower.includes("artbook")) return Boolean(c.SellsArtbook);
          if (lower.includes("good")) return Boolean(c.SellsGoods);
          if (lower.includes("novel")) return Boolean(c.SellsNovel);
          if (lower.includes("game")) return Boolean(c.SellsGame);
          if (lower.includes("music")) return Boolean(c.SellsMusic);
          if (lower.includes("photobook") && lower.includes("cosplay"))
            return Boolean(c.SellsPhotobookCosplay);
          if (lower.includes("photobook")) return Boolean(c.SellsPhotobookGeneral);
          if (lower.includes("handmade")) return Boolean(c.SellsHandmadeCrafts);
          if (lower.includes("mag")) return Boolean(c.SellsMagazine);
          if (lower.includes("commis")) return Boolean(c.SellsCommision);
          return false;
        });
        if (!matchesCategory) return false;
      }

      return true;
    });
  }, [
    rawCircles,
    wishlistIds,
    wishlistOnly,
    activeDay,
    searchTags,
    matchMode,
    productFilters
  ]);

  // Wishlist circles for A3 export
  const wishlistCircles = useMemo(() => {
    const wishlistSet = new Set(wishlistIds.map(String));
    return rawCircles.filter((c) => wishlistSet.has(String(c.id)));
  }, [rawCircles, wishlistIds]);

  // Select circle handler
  const handleSelectCircle = useCallback(
    (circle: RawCircleEntry | null, boothCode?: string) => {
      setSelectedCircle(circle);
      const code = boothCode || circle?.circle_code || null;
      setSelectedBoothCode(code);
      if (circle || code) {
        setDrawerOpen(true);
      }
      if (code && mapApiRef.current) {
        mapApiRef.current.flyToBooth(code);
      }
    },
    []
  );

  // Toggle wishlist handler
  const handleToggleWishlist = useCallback((circleId: string) => {
    toggleWishlist(circleId);
  }, []);

  // Convert selectedCircle to marker format for CircleDrawer
  const selectedDrawerMarker = useMemo(() => {
    if (!selectedCircle) return null;
    const code = selectedBoothCode || selectedCircle.circle_code || "-";
    const hall = detectBoothHall(code, "Hall 8");

    const categories: string[] = [];
    if (selectedCircle.SellsArtbook) categories.push("Artbook");
    if (selectedCircle.SellsComic) categories.push("Comic");
    if (selectedCircle.SellsGoods) categories.push("Goods");
    if (selectedCircle.SellsNovel) categories.push("Novel");
    if (selectedCircle.SellsMusic) categories.push("Music");
    if (selectedCircle.SellsGame) categories.push("Game");
    if (selectedCircle.SellsPhotobookGeneral) categories.push("Photobook");
    if (selectedCircle.SellsPhotobookCosplay) categories.push("Cosplay PB");
    if (selectedCircle.SellsHandmadeCrafts) categories.push("Handmade");
    if (selectedCircle.SellsMagazine) categories.push("Magazine");
    if (selectedCircle.SellsCommision) categories.push("Commissions");

    const socialLinks: Array<{ platform: string; url: string; label: string }> = [];
    if (selectedCircle.circle_twitter)
      socialLinks.push({ platform: "twitter", url: selectedCircle.circle_twitter, label: "X (Twitter)" });
    if (selectedCircle.circle_instagram)
      socialLinks.push({ platform: "instagram", url: selectedCircle.circle_instagram, label: "Instagram" });
    if (selectedCircle.circle_facebook)
      socialLinks.push({ platform: "facebook", url: selectedCircle.circle_facebook, label: "Facebook" });
    if (selectedCircle.circle_youtube)
      socialLinks.push({ platform: "youtube", url: selectedCircle.circle_youtube, label: "YouTube" });

    const sampleWorks: string[] = [];
    if (Array.isArray(selectedCircle.sampleworks_images)) {
      for (const img of selectedCircle.sampleworks_images) {
        if (typeof img === "string" && img.startsWith("http")) sampleWorks.push(img);
      }
    }

    const dayStr = selectedCircle.day || "Both Days";
    const dayLabel = dayStr.toUpperCase().includes("SAT") && !dayStr.toUpperCase().includes("BOTH")
      ? "Day 1 (Sabtu)"
      : dayStr.toUpperCase().includes("SUN") && !dayStr.toUpperCase().includes("BOTH")
        ? "Day 2 (Minggu)"
        : "Both Days (Sabtu & Minggu)";

    return {
      id: `circle-${selectedCircle.id}`,
      circleId: String(selectedCircle.id),
      circleName: selectedCircle.name?.trim() || "Circle Kreator",
      boothCode: code,
      hall,
      day: dayStr,
      dayLabel,
      rating: selectedCircle.rating || undefined,
      fandom: [selectedCircle.fandom, selectedCircle.other_fandom].filter((s) => s && s !== "-").join(" / ") || undefined,
      circleCutUrl: selectedCircle.circle_cut || undefined,
      sampleWorks,
      socialLinks,
      categories,
      posX: 0,
      posY: 0,
      isHighlighted: false,
      isDone: false,
      hasRush: false,
      products: []
    };
  }, [selectedCircle, selectedBoothCode]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#111215] flex flex-col h-[100dvh] w-screen overflow-hidden font-sans select-none">
      {/* 1. TOP VENUE HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#181A20] px-3 sm:px-4 text-zinc-100 z-30">
        {/* Left: Back & Mobile Filter & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/events/cf23"
            title="Kembali ke Ringkasan Event"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden relative flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 text-xs font-bold text-zinc-200"
          >
            <Filter className="h-3.5 w-3.5 text-[#5398DA]" />
            <span>Filters</span>
            {(searchTags.length > 0 || productFilters.length > 0 || wishlistOnly) && (
              <span className="h-2 w-2 rounded-full bg-[#5398DA]" />
            )}
          </button>

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
              Comic Frontier 23 Event Map
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate hidden xs:block">
              Interactive exhibitor map · ICE BSD City Hall 5–10
            </p>
          </div>
        </div>

        {/* Center: Brand */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <span className="font-[var(--font-display)] text-sm tracking-wider text-white">
            ComiPocket
          </span>
          <span className="rounded bg-[#5398DA] px-1.5 py-0.2 font-mono text-[9px] font-bold text-white">
            CF23
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Export Button */}
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-2.5 sm:px-3 text-xs font-bold text-zinc-200 transition-colors shadow-sm"
          >
            <Printer className="h-3.5 w-3.5 text-[#FACC15]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Day Switcher */}
          <div className="hidden sm:flex items-center rounded-lg bg-[#111215] p-0.5 border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveDay("SAT")}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                activeDay === "SAT"
                  ? "bg-[#5398DA] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sabtu
            </button>
            <button
              type="button"
              onClick={() => setActiveDay("SUN")}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                activeDay === "SUN"
                  ? "bg-[#5398DA] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Minggu
            </button>
            <button
              type="button"
              onClick={() => setActiveDay("ALL")}
              className={`px-2 py-1 rounded-md font-bold transition-colors ${
                activeDay === "ALL"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
          </div>

          {/* Wishlist Link / Badge */}
          <Link
            href="/wishlist"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-2.5 text-xs font-bold text-zinc-200 transition-colors"
          >
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <span className="font-mono text-[11px] text-zinc-100">
              {wishlistIds.length}
            </span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <MapSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          isMobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
          activeDay={activeDay}
          onSelectDay={(day) => setActiveDay(day)}
          searchTags={searchTags}
          onAddSearchTag={(tag) => setSearchTags((prev) => [...prev, tag])}
          onRemoveSearchTag={(tag) =>
            setSearchTags((prev) => prev.filter((t) => t !== tag))
          }
          onClearSearchTags={() => setSearchTags([])}
          matchMode={matchMode}
          onToggleMatchMode={() =>
            setMatchMode((prev) => (prev === "ANY" ? "ALL" : "ANY"))
          }
          productFilters={productFilters}
          onToggleProductFilter={(cat) =>
            setProductFilters((prev) =>
              prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
            )
          }
          onClearAllFilters={() => setProductFilters([])}
          wishlistOnly={wishlistOnly}
          onToggleWishlistOnly={() => setWishlistOnly((prev) => !prev)}
          wishlistCount={wishlistCircles.length}
          onOpenExportModal={() => setExportModalOpen(true)}
        />

        {/* Map Center Canvas Container */}
        <main className="relative flex-1 h-full w-full overflow-hidden bg-[#111215]">
          <LeafletMapCanvas
            positions={positions}
            circleDataIndex={circleDataIndex}
            circleDataById={circleDataById}
            wishlistIds={wishlistIds}
            selectedCircleCode={selectedBoothCode}
            selectedCircleId={selectedCircle ? String(selectedCircle.id) : null}
            activeDay={activeDay}
            searchTags={searchTags}
            productFilters={productFilters}
            wishlistOnly={wishlistOnly}
            matchMode={matchMode}
            onSelectCircle={handleSelectCircle}
            onMapReady={(api) => {
              mapApiRef.current = api;
            }}
            tileUrlTemplate="https://cdn.sirkel.id/cf23/tiles/{z}/{y}/{x}.png"
            floorPlanImageUrl="/cf23_floormap.jpg"
            floorPlanSize={[21462, 10178]}
            initialCenter={[-652, 1366]}
            initialZoom={-1}
          />

          {/* Floating Zoom & Reset Map Controls */}
          <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5 rounded-xl border border-zinc-800 bg-[#181A20]/95 p-1.5 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => mapApiRef.current?.zoomIn()}
              aria-label="Perbesar denah (+)"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => mapApiRef.current?.zoomOut()}
              aria-label="Perkecil denah (-)"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="h-px w-full bg-zinc-800" />
            <button
              type="button"
              onClick={() => mapApiRef.current?.resetView()}
              aria-label="Reset pandangan denah"
              title="Reset Tampilan"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Floating Map Legend Indicator */}
          <div className="absolute left-4 bottom-16 sm:bottom-16 z-10 hidden sm:flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#181A20]/90 px-3 py-1.5 text-[11px] text-zinc-300 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] border border-[#1d4ed8]" />
              <span>Circle Stan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] border border-[#a16207]" />
              <span>Wishlist</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] border border-[#b91c1c]" />
              <span>Terpilih</span>
            </div>
          </div>
        </main>

        {/* Selected Circle Detail Drawer */}
        <CircleDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedMarker={selectedDrawerMarker}
          isWishlisted={
            selectedCircle ? wishlistIds.includes(String(selectedCircle.id)) : false
          }
          onToggleWishlist={(id) => handleToggleWishlist(id)}
        />
      </div>

      {/* 3. BOTTOM DOCKED CIRCLE EXPLORER */}
      <CircleExplorer
        isExpanded={explorerExpanded}
        onToggleExpand={() => setExplorerExpanded((prev) => !prev)}
        circles={matchingCircles}
        selectedCircleId={selectedCircle ? String(selectedCircle.id) : null}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onSelectCircle={(circle) => {
          handleSelectCircle(circle, circle.circle_code || undefined);
        }}
      />

      {/* 4. A3 WISHLIST PRINTABLE MAP MODAL */}
      <WishlistMapExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        wishlistCircles={wishlistCircles}
      />
    </div>
  );
}
