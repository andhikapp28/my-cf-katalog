"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface BoothPosition {
  circle_code: string;
  position: [number, number]; // [x, y]
  box_size: [number, number]; // [width, height]
}

export interface RawCircleEntry {
  id: number | string;
  user_id?: string;
  circle_code?: string | null;
  name?: string | null;
  circle_cut?: string | null;
  fandom?: string | null;
  other_fandom?: string | null;
  rating?: string | null;
  day?: string | null;
  circle_twitter?: string | null;
  circle_instagram?: string | null;
  circle_facebook?: string | null;
  circle_youtube?: string | null;
  sampleworks_images?: string[] | null;
  SellsComic?: boolean;
  SellsArtbook?: boolean;
  SellsGoods?: boolean;
  SellsNovel?: boolean;
  SellsGame?: boolean;
  SellsMusic?: boolean;
  SellsPhotobookGeneral?: boolean;
  SellsPhotobookCosplay?: boolean;
  SellsHandmadeCrafts?: boolean;
  SellsMagazine?: boolean;
  SellsCommision?: boolean;
  [key: string]: unknown;
}

export interface LeafletMapCanvasProps {
  positions: BoothPosition[];
  circleDataIndex: Map<string, RawCircleEntry>; // keyed by `${code}:${day}`
  circleDataById?: Map<string, RawCircleEntry>;
  wishlistIds: string[];
  selectedCircleCode: string | null;
  selectedCircleId: string | null;
  activeDay: "SAT" | "SUN" | "ALL";
  searchTags: string[];
  productFilters: string[];
  wishlistOnly: boolean;
  matchMode: "ANY" | "ALL";
  onSelectCircle: (circle: RawCircleEntry | null, boothCode: string) => void;
  onMapReady?: (api: {
    flyToBooth: (code: string) => void;
    flyToPosition: (pos: [number, number], zoom?: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  }) => void;
  tileUrlTemplate?: string;
  floorPlanImageUrl?: string;
  floorPlanSize?: [number, number];
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function LeafletMapCanvas({
  positions,
  circleDataIndex,
  circleDataById: _circleDataById,
  wishlistIds,
  selectedCircleCode,
  selectedCircleId,
  activeDay,
  searchTags,
  productFilters,
  wishlistOnly,
  matchMode,
  onSelectCircle,
  onMapReady,
  tileUrlTemplate = "https://cdn.sirkel.id/cf23/tiles/{z}/{y}/{x}.png",
  floorPlanImageUrl = "/cf23_floormap.jpg",
  floorPlanSize = [21462, 10178],
  initialCenter = [-652, 1366],
  initialZoom = -1
}: LeafletMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(initialZoom);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      try {
        const LModule = await import("leaflet");
        type LeafletStatic = typeof import("leaflet");
        const L: LeafletStatic =
          (LModule as unknown as { default?: LeafletStatic }).default ||
          (LModule as unknown as LeafletStatic);
        leafletRef.current = L;

        if (!isMounted || !containerRef.current) return;

        // Custom Leaflet map with Simple CRS
        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          crs: L.CRS.Simple,
          maxZoom: 5,
          minZoom: -2,
          zoom: initialZoom,
          center: initialCenter,
          renderer: L.canvas({ padding: 0.5 })
        });

        mapRef.current = map;

        // Base image overlay fallback (extracted from user's official PDF floor map)
        const [w, h] = floorPlanSize;
        const imageBounds: [[number, number], [number, number]] = [[-h, 0], [0, w]];

        const fallbackOverlay = L.imageOverlay(floorPlanImageUrl, imageBounds, {
          opacity: 0.95,
          interactive: false
        });
        fallbackOverlay.addTo(map);

        // Tile layer from CDN for multi-resolution crisp rendering
        if (tileUrlTemplate) {
          const tileLayer = L.tileLayer(tileUrlTemplate, {
            minZoom: -2,
            maxZoom: 5,
            maxNativeZoom: 2,
            tileSize: 256,
            tms: false,
            attribution: ""
          });

          // Test tile loading, overlay on top of base image
          tileLayer.addTo(map);
        }

        // Layer group for circle booth markers
        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        // Set initial view
        map.setView(initialCenter, initialZoom);

        // Zoom change listener
        map.on("zoomend", () => {
          setCurrentZoom(map.getZoom());
        });

        // Map ready callback API
        if (onMapReady) {
          onMapReady({
            flyToBooth: (code: string) => {
              const pos = positions.find(
                (p) => p.circle_code.toLowerCase() === code.toLowerCase()
              );
              if (pos) {
                map.flyTo([-pos.position[1], pos.position[0]], 4, {
                  animate: true,
                  duration: 0.6
                });
              }
            },
            flyToPosition: (pos: [number, number], zoom = 4) => {
              map.flyTo([-pos[1], pos[0]], zoom, {
                animate: true,
                duration: 0.6
              });
            },
            zoomIn: () => map.zoomIn(),
            zoomOut: () => map.zoomOut(),
            resetView: () => {
              map.setView(initialCenter, initialZoom, {
                animate: true
              });
            }
          });
        }

        setMapInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Leaflet floor map:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Helper to find circle for a booth
  const resolveCircle = useCallback(
    (boothCode: string): RawCircleEntry | null => {
      if (activeDay !== "ALL") {
        const match = circleDataIndex.get(`${boothCode}:${activeDay}`);
        if (match) return match;
      }
      return (
        circleDataIndex.get(`${boothCode}:Both Days`) ||
        circleDataIndex.get(`${boothCode}:SAT`) ||
        circleDataIndex.get(`${boothCode}:SUN`) ||
        null
      );
    },
    [circleDataIndex, activeDay]
  );

  // Render / Update Markers when filters, zoom, or selections change
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !markersLayerRef.current || !leafletRef.current) {
      return;
    }

    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const zoom = map.getZoom();
    const scaleFactor = Math.pow(2, zoom);
    const wishlistSet = new Set(wishlistIds.map(String));

    // Normalizing product filter tags to circle keys
    const productKeys: (keyof RawCircleEntry)[] = productFilters
      .map((f) => {
        const lower = f.toLowerCase();
        if (lower.includes("comic")) return "SellsComic" as const;
        if (lower.includes("artbook")) return "SellsArtbook" as const;
        if (lower.includes("good")) return "SellsGoods" as const;
        if (lower.includes("novel")) return "SellsNovel" as const;
        if (lower.includes("game")) return "SellsGame" as const;
        if (lower.includes("music")) return "SellsMusic" as const;
        if (lower.includes("photobook") && lower.includes("cosplay"))
          return "SellsPhotobookCosplay" as const;
        if (lower.includes("photobook")) return "SellsPhotobookGeneral" as const;
        if (lower.includes("handmade")) return "SellsHandmadeCrafts" as const;
        if (lower.includes("mag")) return "SellsMagazine" as const;
        if (lower.includes("commis")) return "SellsCommision" as const;
        return null;
      })
      .filter(Boolean) as (keyof RawCircleEntry)[];

    // Filter and render markers
    for (const booth of positions) {
      const circle = resolveCircle(booth.circle_code);
      const circleIdStr = circle ? String(circle.id) : null;
      const isWishlist = circleIdStr ? wishlistSet.has(circleIdStr) : false;

      // Filter: Wishlist Only
      if (wishlistOnly && !isWishlist) {
        continue;
      }

      // Filter: Day
      if (activeDay !== "ALL" && circle) {
        const circleDay = (circle.day || "").toUpperCase();
        if (activeDay === "SAT" && circleDay.includes("SUN") && !circleDay.includes("BOTH") && !circleDay.includes("SAT")) {
          continue;
        }
        if (activeDay === "SUN" && circleDay.includes("SAT") && !circleDay.includes("BOTH") && !circleDay.includes("SUN")) {
          continue;
        }
      }

      // Filter: Search Tags
      if (searchTags.length > 0) {
        const textToSearch = [
          booth.circle_code,
          circle?.name || "",
          circle?.fandom || "",
          circle?.other_fandom || "",
          circle?.rating || ""
        ]
          .join(" ")
          .toLowerCase();

        if (matchMode === "ALL") {
          const allMatch = searchTags.every((tag) =>
            textToSearch.includes(tag.toLowerCase())
          );
          if (!allMatch) continue;
        } else {
          const anyMatch = searchTags.some((tag) =>
            textToSearch.includes(tag.toLowerCase())
          );
          if (!anyMatch) continue;
        }
      }

      // Filter: Products
      if (productKeys.length > 0 && circle) {
        const matchesProduct = productKeys.some((k) => Boolean(circle[k]));
        if (!matchesProduct) continue;
      }

      const [x, y] = booth.position;
      const lat = -y;
      const lng = x;

      const isSelected =
        selectedCircleCode === booth.circle_code ||
        (circleIdStr !== null && selectedCircleId === circleIdStr);

      // Visual rendering mode: Circle Cut Icon at High Zoom, or Canvas CircleMarker at Low/Medium Zoom
      if (zoom >= 2 && circle?.circle_cut) {
        const width = Math.max(16, booth.box_size[0] * scaleFactor);
        const height = Math.max(16, booth.box_size[1] * scaleFactor);

        const borderColor = isSelected
          ? "#ef4444"
          : isWishlist
            ? "#eab308"
            : "#3b82f6";

        const div = document.createElement("div");
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.backgroundImage = `url(${circle.circle_cut})`;
        div.style.backgroundSize = "contain";
        div.style.backgroundRepeat = "no-repeat";
        div.style.backgroundPosition = "center";
        div.style.border = `2px solid ${borderColor}`;
        div.style.borderRadius = "3px";
        div.style.backgroundColor = "#181A20";
        div.style.boxShadow = isSelected
          ? "0 0 10px rgba(239, 68, 68, 0.8)"
          : isWishlist
            ? "0 0 8px rgba(234, 179, 8, 0.7)"
            : "none";
        div.style.cursor = "pointer";

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: div,
            iconSize: [width, height],
            iconAnchor: [width / 2, height / 2],
            className: "cf23-booth-cut-marker"
          })
        });

        marker.on("click", () => {
          onSelectCircle(circle, booth.circle_code);
        });

        marker.addTo(layer);
      } else {
        // High performance canvas circle marker
        const baseRadius = 5;
        const radius = Math.max(
          3,
          Math.min(10, baseRadius * scaleFactor * 0.8)
        );

        const fillColor = isSelected
          ? "#ef4444"
          : isWishlist
            ? "#eab308"
            : "#3b82f6";

        const strokeColor = isSelected
          ? "#b91c1c"
          : isWishlist
            ? "#a16207"
            : "#1d4ed8";

        const circleMarker = L.circleMarker([lat, lng], {
          radius: isSelected || isWishlist ? radius + 1.5 : radius,
          fillColor,
          color: strokeColor,
          weight: isSelected || isWishlist ? 2.5 : 1.5,
          opacity: 0.9,
          fillOpacity: isSelected || isWishlist ? 0.95 : 0.7,
          interactive: true
        });

        circleMarker.on("click", () => {
          onSelectCircle(circle, booth.circle_code);
        });

        circleMarker.addTo(layer);
      }
    }
  }, [
    mapInitialized,
    positions,
    resolveCircle,
    wishlistIds,
    selectedCircleCode,
    selectedCircleId,
    activeDay,
    searchTags,
    productFilters,
    wishlistOnly,
    matchMode,
    currentZoom,
    onSelectCircle
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#111215]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
