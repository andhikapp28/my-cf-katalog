import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq, asc, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  boothLocations,
  events,
  floorMaps,
  products
} from "@/db/schema";
import {
  getBoothFloorCoordinates,
  parseCircleNotes,
  detectBoothHall,
  getBoothMasterCoordinates,
  ICE_BSD_HALLS,
  CF23_COMMUNITY_ZONES,
  type CircleMarker,
  type CommunityZone,
  type HallDefinition
} from "@/lib/floor-map";
import { getEventDetailDataWithFallback } from "@/lib/event-details-data";
import { isDoneProductStatus } from "@/lib/checklist";

interface RawCatalogEntry {
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
  sampleworks_images?: string[] | null;
  [key: string]: unknown;
}

let catalogCache: Map<string, RawCatalogEntry> | null = null;

export function getCatalogCache(): Map<string, RawCatalogEntry> {
  if (catalogCache) return catalogCache;

  catalogCache = new Map();
  const candidatePaths = [
    resolve(process.cwd(), "data", "comifuro22-full.json")
  ];

  for (const p of candidatePaths) {
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, "utf-8"));
        const items: RawCatalogEntry[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.circles)
            ? raw.circles
            : Array.isArray(raw?.data)
              ? raw.data
              : [];

        for (const item of items) {
          if (item.circle_code?.trim()) {
            catalogCache.set(item.circle_code.trim().toUpperCase(), item);
          }
          if (item.name?.trim()) {
            catalogCache.set(item.name.trim().toLowerCase(), item);
          }
        }
      } catch {
        // Abaikan bila pembacaan file gagal
      }
    }
  }

  return catalogCache;
}

/**
 * Muat data lengkap untuk Interactive Floor Map Viewer (Hall 8 & Hall 9).
 */
export async function getInteractiveMapData(targetMapId?: string) {
  const activeEvent =
    (await db.query.events.findFirst({
      where: eq(events.isActive, true),
      orderBy: [desc(events.startsAt)]
    })) ??
    (await db.query.events.findFirst({
      orderBy: [desc(events.startsAt)]
    }));

  if (!activeEvent) {
    return null;
  }

  const allFloorMaps = await db.query.floorMaps.findMany({
    where: eq(floorMaps.eventId, activeEvent.id),
    orderBy: [asc(floorMaps.hall), asc(floorMaps.name)],
    with: {
      event: true
    }
  });

  if (allFloorMaps.length === 0) {
    return null;
  }

  const currentMap =
    (targetMapId ? allFloorMaps.find((m) => m.id === targetMapId) : allFloorMaps[0]) ??
    allFloorMaps[0];

  const locations = await db.query.boothLocations.findMany({
    where: eq(boothLocations.floorMapId, currentMap.id),
    with: {
      circle: true
    }
  });

  // Batch-load produk target event dalam 1 query
  const eventProducts = await db.query.products.findMany({
    where: eq(products.eventId, currentMap.eventId)
  });

  const productsByCircleId = new Map<string, typeof eventProducts>();
  for (const prod of eventProducts) {
    const list = productsByCircleId.get(prod.circleId) ?? [];
    list.push(prod);
    productsByCircleId.set(prod.circleId, list);
  }

  const catalog = getCatalogCache();

  const markers: CircleMarker[] = locations.map((location) => {
    const circle = location.circle;
    const circleProducts = productsByCircleId.get(circle.id) ?? [];

    const isHighlighted = circleProducts.some(
      (p) => p.priority === "HIGH" || p.status === "TARGET" || p.status === "PO_OPEN"
    );
    const isDone = circleProducts.length > 0 && circleProducts.every((p) => isDoneProductStatus(p.status));
    const hasRush = circleProducts.some((p) => p.isRush && !isDoneProductStatus(p.status));

    // Ekstraksi metadata circle dari notes & social link
    const parsed = parseCircleNotes(circle.notes, circle.socialLink);

    // Cari metadata tambahan dari raw catalog (CF22/CF20) jika ada
    const rawCatalogItem =
      catalog.get(location.boothCode.trim().toUpperCase()) ??
      catalog.get(circle.name.trim().toLowerCase());

    const fandom =
      parsed.fandom ??
      (rawCatalogItem?.fandom && rawCatalogItem.fandom !== "-"
        ? [rawCatalogItem.fandom, rawCatalogItem.other_fandom].filter((s) => s && s !== "-").join(" / ")
        : null);

    const rating =
      parsed.rating !== "GA"
        ? parsed.rating
        : rawCatalogItem?.rating?.toUpperCase().includes("M")
          ? "M"
          : rawCatalogItem?.rating?.toUpperCase().includes("PG")
            ? "PG"
            : "GA";

    const circleCutUrl =
      parsed.circleCutUrl ??
      rawCatalogItem?.circle_cut ??
      null;

    const sampleWorks: string[] = [];
    if (Array.isArray(rawCatalogItem?.sampleworks_images)) {
      for (const img of rawCatalogItem.sampleworks_images) {
        if (typeof img === "string" && img.startsWith("http")) {
          sampleWorks.push(img);
        }
      }
    }
    for (const p of circleProducts) {
      if (p.imageUrl && p.imageUrl.startsWith("http") && !sampleWorks.includes(p.imageUrl)) {
        sampleWorks.push(p.imageUrl);
      }
    }

    // Koordinat lantai: bila masih default (50, 50), hitung koordinat akurat venue ICE BSD
    let posX = location.posX;
    let posY = location.posY;
    if (posX === 50 && posY === 50) {
      const computed = getBoothFloorCoordinates(location.boothCode, currentMap.hall || currentMap.name);
      posX = computed.x;
      posY = computed.y;
    }

    const dayLabel =
      location.day === "DAY_1"
        ? "Day 1 (Sabtu)"
        : location.day === "DAY_2"
          ? "Day 2 (Minggu)"
          : "Both Days (Sabtu & Minggu)";

    return {
      id: location.id,
      circleId: circle.id,
      circleName: circle.name,
      circleSlug: circle.slug,
      boothCode: location.boothCode,
      day: location.day,
      dayLabel,
      rating,
      fandom,
      description: parsed.description ?? circle.notes ?? null,
      circleCutUrl,
      sampleWorks,
      socialLinks: parsed.socialLinks,
      categories: parsed.categories,
      hasRush,
      posX,
      posY,
      isHighlighted,
      isDone,
      products: circleProducts
        .filter((p) => !isDoneProductStatus(p.status))
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          isRush: p.isRush,
          status: p.status
        }))
    };
  });

  return {
    event: activeEvent,
    currentMap,
    allFloorMaps,
    markers
  };
}

let cf22ArchiveMarkersCache: CircleMarker[] | null = null;

export function loadCF22ArchiveMarkers(): CircleMarker[] {
  if (cf22ArchiveMarkersCache) return cf22ArchiveMarkersCache;

  const jsonPath = resolve(process.cwd(), "data", "comifuro22-full.json");
  if (!existsSync(jsonPath)) {
    cf22ArchiveMarkersCache = [];
    return cf22ArchiveMarkersCache;
  }

  try {
    const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.circles)
        ? raw.circles
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

    const markers: CircleMarker[] = [];

    for (const item of items) {
      if (!item.circle_code?.trim()) continue;

      const code = item.circle_code.trim();
      const hall = detectBoothHall(code, "Hall 8");
      const localCoords = getBoothFloorCoordinates(code, hall);
      const masterCoords = getBoothMasterCoordinates(code, hall);

      const day =
        item.day === "Day 1"
          ? "DAY_1"
          : item.day === "Day 2"
            ? "DAY_2"
            : "ALL_DAYS";

      const dayLabel =
        day === "DAY_1"
          ? "Day 1 (Sabtu)"
          : day === "DAY_2"
            ? "Day 2 (Minggu)"
            : "Both Days (Sabtu & Minggu)";

      const rating = item.rating?.toUpperCase().includes("M")
        ? "M"
        : item.rating?.toUpperCase().includes("PG")
          ? "PG"
          : "GA";

      const fandom =
        [item.fandom, item.other_fandom]
          .filter((s) => s && s !== "-")
          .join(" / ") || null;

      const sampleWorks: string[] = [];
      if (Array.isArray(item.sampleworks_images)) {
        for (const img of item.sampleworks_images) {
          if (typeof img === "string" && img.startsWith("http")) {
            sampleWorks.push(img);
          }
        }
      }

      const socialLinks: Array<{ platform: string; url: string; label: string }> = [];
      if (item.circle_twitter) {
        socialLinks.push({
          platform: "twitter",
          url: item.circle_twitter,
          label: "X (Twitter)"
        });
      }
      if (item.circle_instagram) {
        socialLinks.push({
          platform: "instagram",
          url: item.circle_instagram,
          label: "Instagram"
        });
      }
      if (item.circle_facebook) {
        socialLinks.push({
          platform: "facebook",
          url: item.circle_facebook,
          label: "Facebook"
        });
      }

      const categories: string[] = [];
      if (item.SellsArtbook) categories.push("Artbook");
      if (item.SellsComic) categories.push("Comic");
      if (item.SellsGoods) categories.push("Goods");
      if (item.SellsNovel) categories.push("Novel");
      if (item.SellsMusic) categories.push("Music");
      if (item.SellsGame) categories.push("Game");

      markers.push({
        id: `cf22-booth-${item.id || item.user_id || code}`,
        circleId: String(item.user_id || item.id || code),
        circleName: item.name?.trim() || "Circle Kreator",
        circleSlug: undefined,
        boothCode: code,
        hall,
        day,
        dayLabel,
        rating,
        fandom,
        description: null,
        circleCutUrl: item.circle_cut || null,
        sampleWorks,
        socialLinks,
        categories,
        posX: localCoords.x,
        posY: localCoords.y,
        masterX: masterCoords.x,
        masterY: masterCoords.y,
        isHighlighted: false,
        isDone: false,
        hasRush: false,
        products: []
      });
    }

    cf22ArchiveMarkersCache = markers;
    return cf22ArchiveMarkersCache;
  } catch (err) {
    console.error("Gagal membaca arsip CF22:", err);
    cf22ArchiveMarkersCache = [];
    return cf22ArchiveMarkersCache;
  }
}

export interface EventMapPageData {
  slug: string;
  event: {
    id: string;
    name: string;
    slug: string;
    venue: string;
    datesText: string;
    editionNumber: number;
    hallsText: string;
  };
  isCf23: boolean;
  isCf22: boolean;
  statusText?: string;
  halls: HallDefinition[];
  communityZones: CommunityZone[];
  archiveMarkers: CircleMarker[];
}

export async function getEventMapPageData(rawSlug: string): Promise<EventMapPageData> {
  const normalizedSlug = rawSlug.toLowerCase().trim();
  const isCf23 = normalizedSlug === "cf23" || normalizedSlug === "cf-23";
  const isCf22 = normalizedSlug === "cf22" || normalizedSlug === "cf-22";

  let eventRecord = null;
  try {
    eventRecord = await db.query.events.findFirst({
      where: eq(events.slug, normalizedSlug)
    });
  } catch {
    // Fallback bila database belum terkoneksi
  }

  const guide = getEventDetailDataWithFallback(rawSlug, eventRecord?.name, eventRecord?.venue);
  const archiveMarkers = loadCF22ArchiveMarkers();

  return {
    slug: normalizedSlug,
    event: {
      id: eventRecord?.id || `event-${normalizedSlug}`,
      name: eventRecord?.name || guide.editionName,
      slug: normalizedSlug,
      venue: eventRecord?.venue || guide.venueFull,
      datesText: guide.datesText,
      editionNumber: guide.editionNumber,
      hallsText: guide.attendance.venueHalls
    },
    isCf23,
    isCf22,
    statusText: isCf23
      ? "Denah Venue CF 23 (Hall 5-10) — Penempatan meja booth 1.959 circle sedang menunggu rilis resmi panitia"
      : undefined,
    halls: ICE_BSD_HALLS,
    communityZones: CF23_COMMUNITY_ZONES,
    archiveMarkers
  };
}
