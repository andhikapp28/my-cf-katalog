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
  hall?: string;
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
  masterX?: number;
  masterY?: number;
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
 * Komparasi natural sorting kode booth (misal: A-01, A-02, A-10, AA-01, B-01).
 * Kode kosong atau tidak terdefinisi akan diletakkan di akhir urutan.
 */
export function compareBoothCodes(a?: string | null, b?: string | null): number {
  const codeA = (a || "").trim();
  const codeB = (b || "").trim();

  if (!codeA && !codeB) return 0;
  if (!codeA) return 1;
  if (!codeB) return -1;

  return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Mengambil kode booth primer untuk sebuah circle.
 */
export function getCirclePrimaryBoothCode(circle: {
  boothLocations?: Array<{ boothCode?: string | null }> | null;
  boothCode?: string | null;
}): string {
  if (circle.boothCode && circle.boothCode.trim()) {
    return circle.boothCode.trim();
  }
  if (!circle.boothLocations || circle.boothLocations.length === 0) {
    return "";
  }
  const codes = circle.boothLocations
    .map((b) => (b.boothCode || "").trim())
    .filter(Boolean);
  if (codes.length === 0) {
    return "";
  }
  codes.sort(compareBoothCodes);
  return codes[0] || "";
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

    return compareBoothCodes(a.boothCode, b.boothCode);
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

// ---------------------------------------------------------------------------
// Arsitektur Master Venue ICE BSD City (Hall 5 s/d Hall 10)
// Koordinat master dinormalisasi pada SVG canvas 2400 x 1200
// ---------------------------------------------------------------------------

export interface HallDefinition {
  id: string; // e.g. "hall-5"
  hallNumber: number; // 5, 6, 7, 8, 9, 10
  name: string; // "Hall 5"
  title: string; // "Free Community Booths"
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  themeColor: string;
  accentColor: string;
  facilities: string[];
  aisles?: string[];
}

export const ICE_BSD_HALLS: HallDefinition[] = [
  {
    id: "hall-5",
    hallNumber: 5,
    name: "Hall 5",
    title: "Free Community Booths",
    subtitle: "Komunitas Kreatif, Game Dev Lokal & Itasha",
    x: 60,
    y: 120,
    width: 360,
    height: 780,
    themeColor: "#059669",
    accentColor: "#10B981",
    facilities: [
      "Free Community Tables (FC-01 s/d FC-16)",
      "Indie Game Dev Pavilion (IG-01 s/d IG-08)",
      "Itasha Community Showcase",
      "Community Stage & Lounge"
    ]
  },
  {
    id: "hall-6",
    hallNumber: 6,
    name: "Hall 6",
    title: "F&B, Rest Area & Main Stage",
    subtitle: "Panggung Utama, Kuliner & Ruang Ganti Cosplay",
    x: 440,
    y: 120,
    width: 360,
    height: 780,
    themeColor: "#D97706",
    accentColor: "#F59E0B",
    facilities: [
      "Panggung Utama / Main Stage & Cosplay Runway",
      "Area Kuliner & Food Court",
      "Rest Area Pengunjung (Karpet & Kursi)",
      "Ruang Ganti Cosplay Putra & Putri (Rp 10.000)",
      "Pos Medis & Musholla ICE BSD"
    ]
  },
  {
    id: "hall-7",
    hallNumber: 7,
    name: "Hall 7",
    title: "Circle Market (Barat)",
    subtitle: "Artist Alley & Creator Market Aisle A - F",
    x: 820,
    y: 120,
    width: 360,
    height: 780,
    themeColor: "#7C3AED",
    accentColor: "#8B5CF6",
    facilities: [
      "Creator Aisles A - F",
      "Area Foto Cosplay Beretika",
      "Creator Showcase Display"
    ],
    aisles: ["A", "B", "C", "D", "E", "F"]
  },
  {
    id: "hall-8",
    hallNumber: 8,
    name: "Hall 8",
    title: "Artist Alley Premium",
    subtitle: "Island AA - AG & Creator Aisles G - M",
    x: 1200,
    y: 120,
    width: 360,
    height: 780,
    themeColor: "#0284C7",
    accentColor: "#38BDF8",
    facilities: [
      "Island Booths AA s/d AG",
      "Creator Aisles G s/d M",
      "Stasiun Pengisian Daya (Charging Station)",
      "Dispenser Air Minum Gratis"
    ],
    aisles: ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "G", "H", "I", "J", "K", "L", "M"]
  },
  {
    id: "hall-9",
    hallNumber: 9,
    name: "Hall 9",
    title: "Corporate & Circle Market",
    subtitle: "Stan Komersial TC-01 - TC-16 & Aisles N - Z",
    x: 1580,
    y: 120,
    width: 360,
    height: 780,
    themeColor: "#2563EB",
    accentColor: "#3B82F6",
    facilities: [
      "Corporate Exhibition TC-01 s/d TC-16",
      "Creator Aisles N s/d S & Z",
      "Creator & Media Partner Lounge"
    ],
    aisles: ["TC", "N", "O", "P", "Q", "R", "S", "Z"]
  },
  {
    id: "hall-10",
    hallNumber: 10,
    name: "Hall 10",
    title: "Ticketing & Shuttle Terminal",
    subtitle: "Penukaran Gelang Ticket2u & Shuttle Bus Lorena",
    x: 1960,
    y: 120,
    width: 360,
    height: 780,
    themeColor: "#0D9488",
    accentColor: "#14B8A6",
    facilities: [
      "Loket Penukaran Gelang Ticket2u (08:00 - 18:15 WIB)",
      "Halte Shuttle Bus Gratis Lorena (St. Cisauk ⇄ Hall 10)",
      "Penitipan Barang / Luggage Storage",
      "Pintu Masuk Utama & Pemeriksaan Keamanan"
    ]
  }
];

export interface CommunityZone {
  id: string;
  code: string;
  name: string;
  hall: string;
  category: "COMMUNITY" | "STAGE" | "FOOD" | "REST" | "FACILITY" | "CORPORATE" | "TICKET";
  masterX: number;
  masterY: number;
  width: number;
  height: number;
  description: string;
  operatingHours?: string;
  tags: string[];
  rules?: string[];
  isInteractive: boolean;
  dayLabel?: string;
}

export const CF23_COMMUNITY_ZONES: CommunityZone[] = [
  // --- HALL 5: FREE COMMUNITY BOOTHS & INDIE SHOWCASE ---
  {
    id: "zone-com-stage",
    code: "HALL 5 · MINI STAGE",
    name: "Community Talk & Gathering Stage",
    hall: "Hall 5",
    category: "STAGE",
    masterX: 80,
    masterY: 150,
    width: 320,
    height: 110,
    description: "Panggung mini talkshow komunitas kreatif, sharing session komikus indie, dan temu fandom ramah.",
    operatingHours: "10:00 - 17:30 WIB",
    tags: ["Mini Stage", "Sharing Session", "Komunitas Kreatif"],
    rules: ["Dilarang memblokir lorong", "Hormati pembicara yang sedang presentasi"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-itasha",
    code: "HALL 5 · ITASHA",
    name: "Itasha Community Showcase",
    hall: "Hall 5",
    category: "COMMUNITY",
    masterX: 80,
    masterY: 280,
    width: 320,
    height: 120,
    description: "Pameran kendaraan mobil & motor bertema karya anime dan karakter komik dari komunitas Itasha Indonesia.",
    operatingHours: "08:30 - 18:00 WIB",
    tags: ["Itasha Indonesia", "Pameran Mobil Anime", "Photo Spot"],
    rules: ["Dilarang menyentuh kendaraan tanpa izin pemilik", "Dilarang menaruh barang bawaan di atas kap mesin"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-game-dev",
    code: "HALL 5 · INDIE GAME",
    name: "Local Indie Game Dev Pavilion",
    hall: "Hall 5",
    category: "COMMUNITY",
    masterX: 80,
    masterY: 420,
    width: 320,
    height: 130,
    description: "Area showcase interaktif dan playtest langsung karya game buatan studio independen lokal Indonesia.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Indie Game", "Playtest Gratis", "Developer Lokal"],
    rules: ["Waktu main per pengunjung max 10 menit saat antre", "Beri masukan ramah kepada developer"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-fc-cluster-1",
    code: "HALL 5 · FC 01-08",
    name: "Free Community Tables (Sayap Utara)",
    hall: "Hall 5",
    category: "COMMUNITY",
    masterX: 80,
    masterY: 570,
    width: 150,
    height: 270,
    description: "Meja ruang pamer komik & doujin mandiri bebas biaya kurasi komite CF 23 (Meja FC-01 s/d FC-08).",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Free Community Booth", "Komik Mandiri", "Non-Profit"],
    rules: ["100% Bebas AI generatif", "Hanya menjual karya orisinal / fanwork buatan sendiri"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-fc-cluster-2",
    code: "HALL 5 · FC 09-16",
    name: "Free Community Tables (Sayap Selatan)",
    hall: "Hall 5",
    category: "COMMUNITY",
    masterX: 250,
    masterY: 570,
    width: 150,
    height: 270,
    description: "Meja ruang pamer komunitas kreatif fandom & kerajinan tangan bebas biaya kurasi CF 23 (Meja FC-09 s/d FC-16).",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Free Community Booth", "Fandom Non-Profit", "Komunitas"],
    rules: ["100% Bebas AI generatif", "Menjaga kebersihan meja stan"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },

  // --- HALL 6: STAGE, F&B & REST AREA ---
  {
    id: "zone-main-stage",
    code: "HALL 6 · MAIN STAGE",
    name: "Panggung Utama & Cosplay Runway",
    hall: "Hall 6",
    category: "STAGE",
    masterX: 460,
    masterY: 150,
    width: 320,
    height: 160,
    description: "Panggung megah pertunjukan anisong, kompetisi cosplay tematik Halloween, dan pengumuman karya pilihan komite.",
    operatingHours: "10:00 - 18:00 WIB",
    tags: ["Panggung Utama", "Cosplay Runway", "Halloween Special", "Anisong Jam"],
    rules: ["Dilarang berdiri di atas kursi", "Bagi fotografer gunakan area media yang ditentukan"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-rest-area",
    code: "HALL 6 · REST AREA",
    name: "Rest Area Pengunjung (Lounge Karpet)",
    hall: "Hall 6",
    category: "REST",
    masterX: 460,
    masterY: 330,
    width: 320,
    height: 120,
    description: "Area istirahat beralas karpet khusus pengunjung untuk istirahat sejenak, menata belanjaan, dan bersantai.",
    operatingHours: "08:30 - 18:30 WIB",
    tags: ["Rest Area", "Karpet", "Tempat Duduk", "Dilarang Tidur"],
    rules: ["Lepas alas kaki bila duduk di karpet utama", "Jaga barang bawaan belanjaan pribadi"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-fb-court",
    code: "HALL 6 · FOOD COURT",
    name: "Area Kuliner & F&B Food Court",
    hall: "Hall 6",
    category: "FOOD",
    masterX: 460,
    masterY: 470,
    width: 320,
    height: 200,
    description: "Tenant makanan berat (nasi bento, ramen, rice bowl), snack jepang (takoyaki, taiyaki), dan minuman dingin.",
    operatingHours: "08:30 - 18:30 WIB",
    tags: ["Food Court", "Minuman Dingin", "Makanan Berat", "QRIS & Tunai"],
    rules: ["Buang sampah sisa makanan di tempat sampah terpilah", "Sediakan uang tunai pecahan pas bila sinyal internet padat"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-cos-room",
    code: "HALL 6 · RUANG GANTI",
    name: "Ruang Ganti Cosplay Putra & Putri",
    hall: "Hall 6",
    category: "FACILITY",
    masterX: 460,
    masterY: 690,
    width: 155,
    height: 150,
    description: "Fasilitas ruang ganti resmi berbayar (Rp 10.000) dilengkapi cermin, meja rias, dan pengawas kebersihan.",
    operatingHours: "08:00 - 18:00 WIB",
    tags: ["Ruang Ganti Cosplay", "Kaca Rias", "Berbayar Rp 10.000"],
    rules: ["Dilarang memotong wig di dalam ruang ganti", "Dilarang menggunakan spray cat atau pewarna berbau tajam"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-medic-musholla",
    code: "HALL 6 · MEDIS & MUSH",
    name: "Pos Medis & Musholla ICE BSD",
    hall: "Hall 6",
    category: "FACILITY",
    masterX: 625,
    masterY: 690,
    width: 155,
    height: 150,
    description: "Pos pertolongan pertama PMI & ruang ibadah sholat pria dan wanita ber-AC dengan tempat wudhu bersih.",
    operatingHours: "08:00 - 18:30 WIB",
    tags: ["Pos Medis", "First Aid", "Musholla Pria & Wanita"],
    rules: ["Bagi pengunjung yang merasa pusing atau dehidrasi segera laporkan ke tim medis"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },

  // --- HALL 7: CIRCLE MARKET BARAT ---
  {
    id: "zone-aisle-af",
    code: "HALL 7 · AISLE A - F",
    name: "Circle Market Barat (Aisle A s/d F)",
    hall: "Hall 7",
    category: "COMMUNITY",
    masterX: 840,
    masterY: 150,
    width: 320,
    height: 520,
    description: "Zona stan kreator doujinshi, komik cetak mandiri, artbook ilustrasi, dan novel orisinal.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Circle Market", "Aisle A - F", "Komik & Artbook"],
    rules: ["Dilarang berhenti melintang di tengah lorong koridor jalan"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-photo-hall7",
    code: "HALL 7 · PHOTO ZONE",
    name: "Official Cosplay Photo Backdrop",
    hall: "Hall 7",
    category: "FACILITY",
    masterX: 840,
    masterY: 690,
    width: 320,
    height: 150,
    description: "Area foto beretika dengan latar karnaval resmi bertema Halloween Comic Frontier 23.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Backdrop Foto", "Cosplay Etiquette", "Lampu Studio"],
    rules: ["Minta izin cosplayer sebelum memotret", "Dilarang memotret dari sudut bawah (low-angle tidak pantas)"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },

  // --- HALL 8: ARTIST ALLEY PREMIUM ---
  {
    id: "zone-island-aa-ag",
    code: "HALL 8 · ISLAND AA - AG",
    name: "Island Artist Alley (Blok AA s/d AG)",
    hall: "Hall 8",
    category: "COMMUNITY",
    masterX: 1220,
    masterY: 150,
    width: 140,
    height: 600,
    description: "Baris stan pulau tengah (island tables) berisikan ilustrator & komikus papan atas dengan rilisan eksklusif.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Island Tables", "Artist Alley", "Rilisan Eksklusif"],
    rules: ["Antre rapi di sisi meja tanpa memotong jalur pengunjung lain"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-aisle-gm",
    code: "HALL 8 · AISLE G - M",
    name: "Creator Aisles (Blok G s/d M)",
    hall: "Hall 8",
    category: "COMMUNITY",
    masterX: 1380,
    masterY: 150,
    width: 160,
    height: 600,
    description: "Deretan lorong meja kreator merchandise gantungan kunci, photobook, art print, dan novel fiksi.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Aisle G - M", "Merchandise", "Karya Mandiri"],
    rules: ["Siapkan uang pas atau dompet digital sebelum bertransaksi"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-water-hall8",
    code: "HALL 8 · REFILL & CHARGE",
    name: "Water Refill & Charging Station",
    hall: "Hall 8",
    category: "FACILITY",
    masterX: 1220,
    masterY: 770,
    width: 320,
    height: 70,
    description: "Dispenser isi ulang air minum gratis dan soket colokan listrik untuk pengisian daya smartphone.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Air Minum Gratis", "Charging HP", "Fasilitas Umum"],
    rules: ["Bawa tumbler pribadi untuk isi ulang air", "Batas cas HP 20 menit saat ramai"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },

  // --- HALL 9: CORPORATE & CIRCLE MARKET ---
  {
    id: "zone-corp-tc",
    code: "HALL 9 · CORP TC 01-16",
    name: "Corporate Exhibition Pavilion (TC 01-16)",
    hall: "Hall 9",
    category: "CORPORATE",
    masterX: 1600,
    masterY: 150,
    width: 150,
    height: 600,
    description: "Stan pameran komersial publisher manga, distributor gaming ternama, lisensi figure, dan merchandise resmi.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Corporate Booth", "Publisher Resmi", "Gaming", "Official Goods"],
    rules: ["Ikuti panduan antrean stan korporat"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-aisle-nz",
    code: "HALL 9 · AISLE N - Z",
    name: "Creator Aisles (Blok N s/d S & Z)",
    hall: "Hall 9",
    category: "COMMUNITY",
    masterX: 1770,
    masterY: 150,
    width: 150,
    height: 600,
    description: "Deretan stan kreator doujinshi, sticker craft, artbook orisinal, dan novel fiksi penggemar.",
    operatingHours: "09:00 - 18:00 WIB",
    tags: ["Aisle N - Z", "Doujinshi", "Sticker Craft"],
    rules: ["Menjaga ketertiban antrean transaksi stan"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-creator-lounge",
    code: "HALL 9 · CREATOR LOUNGE",
    name: "Exhibitor & Media Partner Lounge",
    hall: "Hall 9",
    category: "FACILITY",
    masterX: 1600,
    masterY: 770,
    width: 320,
    height: 70,
    description: "Ruang istirahat khusus exhibitor lingkaran stan dan mitra media peliput resmi.",
    operatingHours: "08:00 - 18:30 WIB",
    tags: ["Khusus Circle", "Mitra Media", "Lounge"],
    rules: ["Wajib menunjukkan ID Circle / Media Badge untuk masuk"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },

  // --- HALL 10: TICKETING, SHUTTLE & MAIN GATE ---
  {
    id: "zone-ticket-wristband",
    code: "HALL 10 · TIKET & GELANG",
    name: "Loket Penukaran Gelang (Wristband Exchange)",
    hall: "Hall 10",
    category: "TICKET",
    masterX: 1980,
    masterY: 150,
    width: 320,
    height: 200,
    description: "Loket penukaran QR Code e-voucher Ticket2u resmi menjadi wristband gelang kertas antiair.",
    operatingHours: "08:00 - 18:15 WIB (Cut-off 18:15 WIB)",
    tags: ["Penukaran Tiket", "Gelang Masuk", "Ticket2u", "Cut-off 18:15 WIB"],
    rules: [
      "Siapkan e-voucher QR Code dengan tingkat kecerahan layar maksimal",
      "Satu e-voucher berlaku untuk satu pengunjung per hari",
      "Pintu masuk venue tutup 18:30 WIB"
    ],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-luggage-hall10",
    code: "HALL 10 · PENITIPAN",
    name: "Penitipan Barang / Luggage Storage",
    hall: "Hall 10",
    category: "FACILITY",
    masterX: 1980,
    masterY: 370,
    width: 320,
    height: 140,
    description: "Layanan penitipan koper, tas troli, dan kardus besar berbayar dengan pengawasan petugas keamanan.",
    operatingHours: "08:00 - 19:00 WIB",
    tags: ["Penitipan Koper", "Titip Tas", "Aman & Terpantau"],
    rules: ["Dilarang menitipkan barang berharga (uang, paspor, laptop)", "Simpan nomor tiket penitipan dengan baik"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  },
  {
    id: "zone-shuttle-lorena",
    code: "HALL 10 · SHUTTLE BUS",
    name: "Halte Shuttle Bus Gratis Lorena",
    hall: "Hall 10",
    category: "FACILITY",
    masterX: 1980,
    masterY: 1090,
    width: 340,
    height: 70,
    description: "Titik naik dan turun armada shuttle bus Lorena gratis. Rute bolak-balik Stasiun KRL Cisauk & Terminal Intermoda ⇄ Hall 10 ICE BSD City.",
    operatingHours: "07:30 - 19:30 WIB (Tiap 15 - 20 menit)",
    tags: ["Shuttle Bus Lorena", "100% Gratis", "St. Cisauk ⇄ Hall 10", "AC & Nyaman"],
    rules: ["Antre rapi di jalur antrean halte", "Dahulukan penumpang lansia, ibu hamil, dan difabel"],
    isInteractive: true,
    dayLabel: "Both Days (Sabtu & Minggu)"
  }
];

/**
 * Tentukan Hall tempat stan berada secara deterministik dari kode stan dan default event.
 */
export function detectBoothHall(boothCode?: string | null, defaultHall?: string | null): string {
  if (defaultHall && defaultHall.trim()) {
    const norm = defaultHall.trim().toLowerCase();
    if (norm.includes("5")) return "Hall 5";
    if (norm.includes("6")) return "Hall 6";
    if (norm.includes("7")) return "Hall 7";
    if (norm.includes("8")) return "Hall 8";
    if (norm.includes("9")) return "Hall 9";
    if (norm.includes("10")) return "Hall 10";
  }

  const clean = (boothCode || "").trim().toUpperCase();
  if (clean.startsWith("FC") || clean.startsWith("IG") || clean.startsWith("COM")) return "Hall 5";
  if (clean.startsWith("FB") || clean.startsWith("STG") || clean.startsWith("COS")) return "Hall 6";
  if (clean.startsWith("TC") || clean.startsWith("CORP")) return "Hall 9";
  if (clean.startsWith("WRIST") || clean.startsWith("SHUTTLE") || clean.startsWith("TICKET")) return "Hall 10";

  const match = clean.match(/^([A-Z]+)-?(\d+)/);
  if (!match) return "Hall 8";
  const prefix = match[1];

  // Blok Island AA s/d AG di Hall 8
  if (prefix.startsWith("A") && prefix.length === 2) return "Hall 8";

  // Alokasi default: A-M di Hall 8, N-Z di Hall 9
  if (prefix >= "A" && prefix <= "M") return "Hall 8";
  if (prefix >= "N" && prefix <= "Z") return "Hall 9";

  return "Hall 8";
}

/**
 * Konversi kode booth ke koordinat master viewBox (0 0 2400 1200) untuk venue Hall 5 s/d 10.
 */
export function getBoothMasterCoordinates(
  boothCode: string,
  hallName?: string | null
): { x: number; y: number; hall: string } {
  const hallStr = detectBoothHall(boothCode, hallName);
  const hall =
    ICE_BSD_HALLS.find((h) => h.name.toLowerCase() === hallStr.toLowerCase()) ??
    ICE_BSD_HALLS[3]; // default Hall 8

  const local = getBoothFloorCoordinates(boothCode, hall.name);

  const masterX = hall.x + (local.x / 100) * hall.width;
  const masterY = hall.y + (local.y / 100) * hall.height;

  return {
    x: Number(masterX.toFixed(1)),
    y: Number(masterY.toFixed(1)),
    hall: hall.name
  };
}

/**
 * Dapatkan batas koordinat bounding box untuk hall tertentu di master viewBox.
 */
export function getHallBounds(
  hallName: string
): { x: number; y: number; width: number; height: number } | null {
  const norm = hallName.trim().toLowerCase();
  const hall = ICE_BSD_HALLS.find(
    (h) => h.name.toLowerCase() === norm || h.id.toLowerCase() === norm
  );
  if (!hall) return null;
  return { x: hall.x, y: hall.y, width: hall.width, height: hall.height };
}

