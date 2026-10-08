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
  type CircleMarker
} from "@/lib/floor-map";
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
