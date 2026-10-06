export type BoothMarker = {
  id: string;
  boothCode: string;
  /** true bila SEMUA produk di booth ini sudah PURCHASED/CANCELLED/SOLD_OUT. */
  isDone: boolean;
  /** true bila booth ini punya produk priority HIGH atau status TARGET/PO_OPEN untuk event aktif. */
  isHighlighted: boolean;
};

/**
 * Representasi marker lengkap untuk Circle Detail Sheet ala sirkel.id/events/cf22/map
 */
export type CircleMarker = {
  id: string; // boothLocation.id
  circleId: string;
  circleName: string;
  circleSlug?: string;
  boothCode: string;
  day: string; // "DAY_1" | "DAY_2" | "ALL_DAYS"
  dayLabel: string;
  rating?: string; // "GA" | "PG" | "M"
  fandom?: string | null;
  description?: string | null;
  circleCutUrl?: string | null;
  sampleWorks: string[];
  socialLinks: Array<{ platform: string; url: string; label: string }>;
  categories: string[];
  posX: number;
  posY: number;
  isHighlighted: boolean;
  isDone: boolean;
  hasRush: boolean;
  products: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    isRush?: boolean;
    status?: string;
  }>;
};

export interface ParsedCircleMetadata {
  fandom: string | null;
  rating: string;
  circleCutUrl: string | null;
  socialLinks: Array<{ platform: string; url: string; label: string }>;
  categories: string[];
  description: string | null;
}

/**
 * Parse catatan metadata circle yang dihasilkan dari ingestion / database.
 */
export function parseCircleNotes(
  notes?: string | null,
  primarySocialLink?: string | null
): ParsedCircleMetadata {
  const result: ParsedCircleMetadata = {
    fandom: null,
    rating: "GA",
    circleCutUrl: null,
    socialLinks: [],
    categories: [],
    description: null
  };

  const seenSocials = new Set<string>();

  if (primarySocialLink?.trim()) {
    const clean = primarySocialLink.trim();
    seenSocials.add(clean.toLowerCase());
    result.socialLinks.push({
      platform: detectPlatform(clean),
      url: clean,
      label: detectPlatformLabel(clean)
    });
  }

  if (!notes?.trim()) {
    return result;
  }

  const lines = notes.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bioLines: string[] = [];

  for (const line of lines) {
    if (/^Fandom:\s*/i.test(line)) {
      const val = line.replace(/^Fandom:\s*/i, "").trim();
      if (val && val !== "-" && val !== "(-)") {
        result.fandom = val;
      }
    } else if (/^Rating:\s*/i.test(line)) {
      const val = line.replace(/^Rating:\s*/i, "").trim().toUpperCase();
      if (val.includes("M") || val.includes("18") || val.includes("MATURE")) {
        result.rating = "M";
      } else if (val.includes("PG")) {
        result.rating = "PG";
      } else {
        result.rating = "GA";
      }
    } else if (/^Circle Cut:\s*/i.test(line)) {
      const url = line.replace(/^Circle Cut:\s*/i, "").trim();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        result.circleCutUrl = url;
      }
    } else if (/^(Kategori|Categories):\s*/i.test(line)) {
      const val = line.replace(/^(Kategori|Categories):\s*/i, "").trim();
      result.categories = val.split(",").map((c) => c.trim()).filter(Boolean);
    } else if (/^(X\/Twitter|Twitter|Instagram|Facebook|Pixiv|Tiktok|Website):\s*/i.test(line)) {
      const parts = line.split(/:\s*(.+)/);
      const url = parts[1]?.trim();
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        const lower = url.toLowerCase();
        if (!seenSocials.has(lower)) {
          seenSocials.add(lower);
          result.socialLinks.push({
            platform: detectPlatform(url),
            url,
            label: detectPlatformLabel(url)
          });
        }
      }
    } else if (/^Bio:\s*/i.test(line)) {
      const bioText = line.replace(/^Bio:\s*/i, "").trim();
      if (bioText) bioLines.push(bioText);
    } else if (!/^Booth:\s*/i.test(line)) {
      // Baris deskripsi umum
      bioLines.push(line);
    }
  }

  if (bioLines.length > 0) {
    result.description = bioLines.join("\n");
  }

  return result;
}

function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com") || lower.includes("fb.com")) return "facebook";
  if (lower.includes("pixiv.net")) return "pixiv";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("trakteer.id")) return "trakteer";
  return "web";
}

function detectPlatformLabel(url: string): string {
  const p = detectPlatform(url);
  switch (p) {
    case "twitter":
      return "X / Twitter";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "pixiv":
      return "Pixiv";
    case "tiktok":
      return "TikTok";
    case "trakteer":
      return "Trakteer";
    default:
      return "Situs Web";
  }
}

/**
 * Hitung koordinat persentase (posX: 5..95%, posY: 10..90%) denah venue ICE BSD (Hall 8 & 9)
 * secara deterministik berdasarkan kode booth (mis. AA-01, TC-12, A-15a).
 */
export function getBoothFloorCoordinates(
  boothCode: string,
  hallName?: string | null
): { x: number; y: number } {
  const clean = boothCode.trim().toUpperCase();
  const match = clean.match(/^([A-Z]+)-?(\d+)([A-Z])?/);
  const prefix = match ? match[1] : clean.slice(0, 2);
  const num = match ? parseInt(match[2], 10) : 1;
  const suffix = match ? match[3] : "";

  const isHall9 =
    (hallName && hallName.toLowerCase().includes("9")) ||
    prefix === "TC" ||
    (prefix.length === 1 && prefix >= "N" && prefix <= "Z");

  if (isHall9) {
    // Hall 9 (Creators, Corporate TC, Aisles N-S, Z)
    if (prefix === "TC") {
      const col = (num - 1) % 4;
      const row = Math.floor((num - 1) / 4);
      const x = 70 + col * 6.5;
      const y = 28 + Math.min(row, 4) * 11;
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    }

    const aisleMap: Record<string, number> = {
      N: 14,
      O: 21,
      P: 28,
      Q: 35,
      R: 42,
      S: 49,
      Z: 58
    };

    const baseX = aisleMap[prefix] ?? 30;
    const isOdd = num % 2 !== 0;
    const row = Math.floor((num - 1) / 2);
    const x = isOdd ? baseX - 1.2 : baseX + 1.2;
    let y = 18 + (Math.min(row, 36) / 36) * 64;

    if (suffix === "B") y += 0.4;
    if (suffix === "A") y -= 0.4;

    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  } else {
    // Hall 8 (Artist Alley: Island AA-AG, Aisles A-M)
    const islandMap: Record<string, number> = {
      AA: 8,
      AB: 12,
      AC: 16,
      AD: 20,
      AE: 24,
      AF: 28,
      AG: 32
    };

    const aisleMap: Record<string, number> = {
      A: 38,
      B: 43,
      C: 48,
      D: 53,
      E: 58,
      F: 63,
      G: 68,
      H: 73,
      I: 78,
      J: 83,
      K: 87,
      L: 91,
      M: 95
    };

    const baseX = islandMap[prefix] ?? aisleMap[prefix] ?? 50;
    const isOdd = num % 2 !== 0;
    const row = Math.floor((num - 1) / 2);
    const x = isOdd ? baseX - 0.9 : baseX + 0.9;
    let y = 18 + (Math.min(row, 36) / 36) * 64;

    if (suffix === "B") y += 0.4;
    if (suffix === "A") y -= 0.4;

    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  }
}

/**
 * Filter dan sorot markers berdasarkan query pencarian, filter hari, dan wishlist.
 */
export function filterCircleMarkers(
  markers: CircleMarker[],
  options: {
    search?: string;
    dayFilter?: "ALL" | "DAY_1" | "DAY_2" | "WISHLIST";
    fandom?: string;
    wishlistIds?: Set<string> | string[];
  }
): {
  filtered: CircleMarker[];
  matchedIds: Set<string>;
} {
  const { search, dayFilter = "ALL", fandom, wishlistIds } = options;
  const wishSet =
    wishlistIds instanceof Set
      ? wishlistIds
      : Array.isArray(wishlistIds)
        ? new Set(wishlistIds)
        : new Set<string>();

  const query = search?.trim().toLowerCase() || "";
  const fandomQuery = fandom?.trim().toLowerCase() || "";

  const isMatchingQuery = (m: CircleMarker) => {
    if (!query) return true;
    const matchName = m.circleName.toLowerCase().includes(query);
    const matchBooth = m.boothCode.toLowerCase().includes(query);
    const matchFandom = m.fandom ? m.fandom.toLowerCase().includes(query) : false;
    const matchProduct = m.products.some((p) => p.name.toLowerCase().includes(query));
    return matchName || matchBooth || matchFandom || matchProduct;
  };

  const isMatchingDay = (m: CircleMarker) => {
    if (dayFilter === "ALL") return true;
    if (dayFilter === "DAY_1") {
      return m.day === "DAY_1" || m.day === "ALL_DAYS";
    }
    if (dayFilter === "DAY_2") {
      return m.day === "DAY_2" || m.day === "ALL_DAYS";
    }
    if (dayFilter === "WISHLIST") {
      return (
        wishSet.has(m.circleId) ||
        wishSet.has(m.id) ||
        m.products.some((p) => wishSet.has(p.id))
      );
    }
    return true;
  };

  const isMatchingFandom = (m: CircleMarker) => {
    if (!fandomQuery) return true;
    return m.fandom ? m.fandom.toLowerCase().includes(fandomQuery) : false;
  };

  const matchedIds = new Set<string>();
  const filtered: CircleMarker[] = [];

  for (const m of markers) {
    const dayPass = isMatchingDay(m);
    const fandomPass = isMatchingFandom(m);
    const queryPass = isMatchingQuery(m);

    if (dayPass && fandomPass && queryPass) {
      filtered.push(m);
      matchedIds.add(m.id);
      matchedIds.add(m.circleId);
    }
  }

  return { filtered, matchedIds };
}

/**
 * Ekstraksi daftar fandom unik dari sekumpulan markers untuk autocomplete / filter tag.
 */
export function extractUniqueFandoms(markers: CircleMarker[]): string[] {
  const set = new Set<string>();
  for (const m of markers) {
    if (m.fandom) {
      // Split jika format "A / B" atau "A (B)"
      const clean = m.fandom
        .replace(/[()]/g, "")
        .split(/[/,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s !== "-");
      for (const item of clean) {
        set.add(item);
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Pilih booth berikutnya yang perlu dikunjungi untuk rute belanja di venue.
 */
export function pickNextBooth(markers: BoothMarker[], currentBoothId?: string): BoothMarker | null {
  const pending = markers.filter((marker) => !marker.isDone);

  if (pending.length === 0) {
    return null;
  }

  const sorted = [...pending].sort((a, b) => {
    if (a.isHighlighted !== b.isHighlighted) {
      return a.isHighlighted ? -1 : 1;
    }

    return a.boothCode.localeCompare(b.boothCode, undefined, { numeric: true, sensitivity: "base" });
  });

  if (!currentBoothId) {
    return sorted[0];
  }

  const currentIndex = sorted.findIndex((marker) => marker.id === currentBoothId);

  if (currentIndex === -1) {
    return sorted[0];
  }

  return sorted[(currentIndex + 1) % sorted.length];
}

/** Batas zoom pinch untuk floor map viewer (dalam kelipatan skala 1x). */
export const FLOOR_MAP_MIN_SCALE = 1;
export const FLOOR_MAP_MAX_SCALE = 4;

export function clampScale(scale: number) {
  return Math.min(FLOOR_MAP_MAX_SCALE, Math.max(FLOOR_MAP_MIN_SCALE, scale));
}

/**
 * Hitung translate baru supaya titik fokus tetap berada di posisi yang sama
 * secara visual sebelum & sesudah scale berubah.
 */
export function computeFocalTranslate(params: {
  focalX: number;
  focalY: number;
  prevScale: number;
  nextScale: number;
  prevTranslateX: number;
  prevTranslateY: number;
}) {
  const { focalX, focalY, prevScale, nextScale, prevTranslateX, prevTranslateY } = params;

  const scaleRatio = nextScale / prevScale;
  const nextTranslateX = focalX - (focalX - prevTranslateX) * scaleRatio;
  const nextTranslateY = focalY - (focalY - prevTranslateY) * scaleRatio;

  return { translateX: nextTranslateX, translateY: nextTranslateY };
}
