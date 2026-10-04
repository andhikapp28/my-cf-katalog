import { slugify } from "./utils";
import type { EventDay } from "@/db/schema";

export interface RawComifuroItem {
  circle_code?: string | null;
  name?: string | null;
  circle_cut?: string | null;
  fandom?: string | null;
  other_fandom?: string | null;
  day?: string | null;
  rating?: string | null;
  circle_twitter?: string | null;
  circle_instagram?: string | null;
  circle_facebook?: string | null;
  sampleworks_images?: unknown;
  SellsArtbook?: boolean | string | null;
  SellsGoods?: boolean | string | null;
  SellsComic?: boolean | string | null;
  SellsNovel?: boolean | string | null;
  SellsMusic?: boolean | string | null;
  SellsGame?: boolean | string | null;
  SellsCosplay?: boolean | string | null;
  hall?: string | null;
  description?: string | null;
  [key: string]: unknown;
}

export interface NormalizedComifuroCircle {
  boothCode: string;
  name: string;
  primarySocial: string | null;
  circleCutUrl: string | null;
  day: EventDay;
  rawDay: string;
  rating: string;
  fandom: string | null;
  categories: string[];
  notes: string;
  sampleworks: string[];
  hall?: string | null;
}

export interface FloorMapCandidate {
  id: string;
  name: string;
  hall?: string | null;
}

/**
 * Normalisasi URL media sosial (Twitter/X, Instagram, Facebook).
 * Menerima format handle (@user), domain tanpa protokol, atau URL lengkap.
 */
export function normalizeSocialUrl(
  url?: string | null,
  platform?: "twitter" | "instagram" | "facebook"
): string | null {
  if (!url) return null;
  let clean = url.trim();
  if (!clean) return null;

  // Tangani handle dengan awalan @
  if (clean.startsWith("@")) {
    const handle = clean.slice(1);
    if (platform === "instagram") return `https://instagram.com/${handle}`;
    if (platform === "facebook") return `https://facebook.com/${handle}`;
    return `https://x.com/${handle}`;
  }

  // Tangani domain tanpa protokol https://
  if (/^(twitter\.com|x\.com|instagram\.com|facebook\.com)/i.test(clean)) {
    clean = `https://${clean}`;
  }

  try {
    const parsed = new URL(clean);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // URL tidak valid
  }

  return null;
}

/**
 * Memetakan string kehadiran hari Comifuro ("Day 1", "Day 2", "Both Days")
 * ke enum tipe database Drizzle (`DAY_1`, `DAY_2`, `ALL_DAYS`).
 */
export function mapComifuroDay(dayStr?: string | null): EventDay {
  if (!dayStr) return "ALL_DAYS";
  const normalized = dayStr.trim().toLowerCase();

  if (
    normalized === "day 1" ||
    normalized === "day1" ||
    normalized === "1" ||
    normalized === "sat" ||
    normalized === "saturday" ||
    normalized === "sabtu"
  ) {
    return "DAY_1";
  }

  if (
    normalized === "day 2" ||
    normalized === "day2" ||
    normalized === "2" ||
    normalized === "sun" ||
    normalized === "sunday" ||
    normalized === "minggu"
  ) {
    return "DAY_2";
  }

  if (
    normalized === "both days" ||
    normalized === "both day" ||
    normalized === "both" ||
    normalized === "all" ||
    normalized === "all_days" ||
    normalized.includes("both") ||
    (normalized.includes("1") && normalized.includes("2"))
  ) {
    return "ALL_DAYS";
  }

  return "ALL_DAYS";
}

/**
 * Ekstraksi array URL sampleworks dari berbagai representasi (array, JSON string, single URL).
 */
export function extractSampleworksImages(raw: unknown): string[] {
  if (!raw) return [];
  const results: string[] = [];

  const addIfValidUrl = (url: unknown) => {
    if (typeof url !== "string") return;
    const trimmed = url.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      results.push(trimmed);
    }
  };

  if (Array.isArray(raw)) {
    for (const item of raw) {
      addIfValidUrl(item);
    }
    return results;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            addIfValidUrl(item);
          }
          return results;
        }
      } catch {
        // Abaikan bila bukan JSON valid
      }
    }
    addIfValidUrl(trimmed);
  }

  return results;
}

/**
 * Cek nilai boolean dari JSON / string / number.
 */
export function isTruthy(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  }
  if (typeof val === "number") return val === 1;
  return false;
}

/**
 * Ekstraksi kategori barang jualan dari atribut Sells*.
 */
export function extractCategories(item: RawComifuroItem): string[] {
  const cats: string[] = [];
  if (isTruthy(item.SellsComic)) cats.push("Comic/Doujinshi");
  if (isTruthy(item.SellsArtbook)) cats.push("Artbook");
  if (isTruthy(item.SellsGoods)) cats.push("Merchandise/Goods");
  if (isTruthy(item.SellsNovel)) cats.push("Novel");
  if (isTruthy(item.SellsMusic)) cats.push("Music/Audio");
  if (isTruthy(item.SellsGame)) cats.push("Game");
  if (isTruthy(item.SellsCosplay)) cats.push("Cosplay");
  return cats;
}

/**
 * Susun string notes deskriptif untuk circle dari metadata Supabase.
 */
export function buildCircleNotes(params: {
  boothCode: string;
  dayStr: string;
  fandom?: string | null;
  otherFandom?: string | null;
  rating?: string | null;
  categories: string[];
  circleCutUrl?: string | null;
  otherSocials: string[];
  description?: string | null;
}): string {
  const lines: string[] = [];

  lines.push(`Booth: ${params.boothCode} (${params.dayStr})`);

  if (params.fandom || params.otherFandom) {
    const fandomParts = [
      params.fandom?.trim(),
      params.otherFandom?.trim() ? `(${params.otherFandom.trim()})` : ""
    ].filter(Boolean);
    lines.push(`Fandom: ${fandomParts.join(" ")}`);
  }

  if (params.rating) {
    const r = params.rating.trim().toUpperCase();
    const ratingLabel =
      r === "M" || r === "MATURE" || r === "18+" ? "Mature (18+)" : "General (GA)";
    lines.push(`Rating: ${ratingLabel}`);
  }

  if (params.categories.length > 0) {
    lines.push(`Kategori: ${params.categories.join(", ")}`);
  }

  if (params.circleCutUrl) {
    lines.push(`Circle Cut: ${params.circleCutUrl}`);
  }

  if (params.otherSocials.length > 0) {
    lines.push(...params.otherSocials);
  }

  if (params.description?.trim()) {
    lines.push(`Bio: ${params.description.trim()}`);
  }

  return lines.join("\n").slice(0, 2000);
}

/**
 * Bangun slug unik untuk circle agar tidak terjadi pelanggaran unique constraint `circles_slug_unique`.
 */
export function generateUniqueCircleSlug(
  name: string,
  boothCode: string,
  existingSlugs: Set<string>
): string {
  let base = slugify(name);
  if (!base || base.length < 2) {
    base = `circle-${slugify(boothCode) || "booth"}`;
  }

  base = base.slice(0, 140);

  if (!existingSlugs.has(base)) {
    existingSlugs.add(base);
    return base;
  }

  // Jika bentrok, tambahkan kode booth
  const withBooth = `${base}-${slugify(boothCode) || "booth"}`.slice(0, 160);
  if (!existingSlugs.has(withBooth)) {
    existingSlugs.add(withBooth);
    return withBooth;
  }

  // Jika masih bentrok, tambahkan counter
  let counter = 2;
  while (existingSlugs.has(`${withBooth}-${counter}`)) {
    counter++;
  }
  const result = `${withBooth}-${counter}`.slice(0, 180);
  existingSlugs.add(result);
  return result;
}

/**
 * Cocokkan floor map berdasarkan hall yang tertera atau aturan penomoran booth ICE BSD.
 * Blok A s.d. M -> Hall 8 (Artist Alley)
 * Blok N s.d. Z atau TC -> Hall 9 (Creators & Corporate)
 */
export function matchFloorMap<T extends FloorMapCandidate>(
  floorMaps: T[],
  boothCode: string,
  hall?: string | null
): T | null {
  if (floorMaps.length === 0) return null;

  if (hall?.trim()) {
    const hallLower = hall.trim().toLowerCase();
    const match = floorMaps.find(
      (m) =>
        m.hall?.toLowerCase() === hallLower ||
        m.name.toLowerCase().includes(hallLower)
    );
    if (match) return match;
  }

  const code = boothCode.trim().toUpperCase();
  if (code.startsWith("TC") || /^[N-Z]/.test(code)) {
    const hall9 = floorMaps.find(
      (m) =>
        m.hall?.toLowerCase().includes("9") ||
        m.name.toLowerCase().includes("hall 9")
    );
    if (hall9) return hall9;
  }

  if (/^[A-M]/.test(code)) {
    const hall8 = floorMaps.find(
      (m) =>
        m.hall?.toLowerCase().includes("8") ||
        m.name.toLowerCase().includes("hall 8")
    );
    if (hall8) return hall8;
  }

  return floorMaps[0];
}

/**
 * Normalisasi satu record raw item Supabase menjadi format terstruktur yang siap di-upsert.
 */
export function normalizeComifuroItem(
  item: RawComifuroItem
): NormalizedComifuroCircle | null {
  const boothCode = item.circle_code?.trim();
  if (!boothCode) {
    return null;
  }

  const rawName = item.name?.trim();
  const name = (rawName && rawName.length > 0 ? rawName : `Circle ${boothCode}`).slice(0, 160);

  const twitter = normalizeSocialUrl(item.circle_twitter, "twitter");
  const instagram = normalizeSocialUrl(item.circle_instagram, "instagram");
  const facebook = normalizeSocialUrl(item.circle_facebook, "facebook");

  const primarySocial = twitter || instagram || facebook || null;

  const otherSocials: string[] = [];
  if (twitter && twitter !== primarySocial) otherSocials.push(`X/Twitter: ${twitter}`);
  if (instagram && instagram !== primarySocial) otherSocials.push(`Instagram: ${instagram}`);
  if (facebook && facebook !== primarySocial) otherSocials.push(`Facebook: ${facebook}`);

  const circleCutUrl = item.circle_cut?.trim() || null;
  const day = mapComifuroDay(item.day);
  const rawDay = item.day?.trim() || "Both Days";
  const rating = item.rating?.trim() || "GA";

  const fandom = [item.fandom?.trim(), item.other_fandom?.trim()]
    .filter(Boolean)
    .join(" / ") || null;

  const categories = extractCategories(item);
  const sampleworks = extractSampleworksImages(item.sampleworks_images);

  const notes = buildCircleNotes({
    boothCode,
    dayStr: rawDay,
    fandom: item.fandom,
    otherFandom: item.other_fandom,
    rating: item.rating,
    categories,
    circleCutUrl,
    otherSocials,
    description: item.description
  });

  return {
    boothCode,
    name,
    primarySocial,
    circleCutUrl,
    day,
    rawDay,
    rating,
    fandom,
    categories,
    notes,
    sampleworks,
    hall: item.hall?.trim() || null
  };
}
