import { describe, expect, it } from "vitest";
import {
  buildCircleNotes,
  extractCategories,
  extractSampleworksImages,
  generateUniqueCircleSlug,
  mapComifuroDay,
  matchFloorMap,
  normalizeComifuroItem,
  normalizeSocialUrl
} from "@/lib/catalog-ingestion";

describe("catalog-ingestion", () => {
  describe("mapComifuroDay", () => {
    it("memetakan 'Day 1' ke 'DAY_1'", () => {
      expect(mapComifuroDay("Day 1")).toBe("DAY_1");
      expect(mapComifuroDay("day1")).toBe("DAY_1");
      expect(mapComifuroDay("1")).toBe("DAY_1");
    });

    it("memetakan 'Day 2' ke 'DAY_2'", () => {
      expect(mapComifuroDay("Day 2")).toBe("DAY_2");
      expect(mapComifuroDay("day 2")).toBe("DAY_2");
      expect(mapComifuroDay("2")).toBe("DAY_2");
    });

    it("memetakan 'Both Days' / 'Day 1 & Day 2' ke 'ALL_DAYS'", () => {
      expect(mapComifuroDay("Both Days")).toBe("ALL_DAYS");
      expect(mapComifuroDay("both")).toBe("ALL_DAYS");
      expect(mapComifuroDay("all")).toBe("ALL_DAYS");
      expect(mapComifuroDay("Day 1 & Day 2")).toBe("ALL_DAYS");
    });

    it("memberikan fallback 'ALL_DAYS' untuk nilai null/undefined/kosong", () => {
      expect(mapComifuroDay(null)).toBe("ALL_DAYS");
      expect(mapComifuroDay(undefined)).toBe("ALL_DAYS");
      expect(mapComifuroDay("")).toBe("ALL_DAYS");
    });
  });

  describe("normalizeSocialUrl", () => {
    it("menambahkan protokol https:// ke domain murni", () => {
      expect(normalizeSocialUrl("twitter.com/mycircle")).toBe(
        "https://twitter.com/mycircle"
      );
      expect(normalizeSocialUrl("instagram.com/mycircle")).toBe(
        "https://instagram.com/mycircle"
      );
    });

    it("mengonversi handle @user ke URL lengkap", () => {
      expect(normalizeSocialUrl("@artist_id", "twitter")).toBe(
        "https://x.com/artist_id"
      );
      expect(normalizeSocialUrl("@artist_id", "instagram")).toBe(
        "https://instagram.com/artist_id"
      );
      expect(normalizeSocialUrl("@artist_id", "facebook")).toBe(
        "https://facebook.com/artist_id"
      );
    });

    it("mempertahankan URL yang sudah valid", () => {
      expect(normalizeSocialUrl("https://x.com/atelierhanami")).toBe(
        "https://x.com/atelierhanami"
      );
    });

    it("mengembalikan null untuk input yang tidak valid / kosong", () => {
      expect(normalizeSocialUrl(null)).toBeNull();
      expect(normalizeSocialUrl("")).toBeNull();
      expect(normalizeSocialUrl("bukan-url-dan-bukan-handle")).toBeNull();
    });
  });

  describe("extractSampleworksImages", () => {
    it("mengekstrak array URL valid", () => {
      const input = [
        "https://example.com/img1.jpg",
        "https://example.com/img2.png"
      ];
      expect(extractSampleworksImages(input)).toEqual(input);
    });

    it("mengekstrak dari JSON string array", () => {
      const input = JSON.stringify([
        "https://example.com/sample1.jpg",
        "https://example.com/sample2.jpg"
      ]);
      expect(extractSampleworksImages(input)).toEqual([
        "https://example.com/sample1.jpg",
        "https://example.com/sample2.jpg"
      ]);
    });

    it("mengekstrak single URL string", () => {
      expect(
        extractSampleworksImages("https://example.com/single.jpg")
      ).toEqual(["https://example.com/single.jpg"]);
    });

    it("mengabaikan null, string kosong, atau array kosong", () => {
      expect(extractSampleworksImages(null)).toEqual([]);
      expect(extractSampleworksImages([])).toEqual([]);
      expect(extractSampleworksImages("")).toEqual([]);
    });
  });

  describe("extractCategories", () => {
    it("mengidentifikasi kategori produk yang dijual berdasarkan Sells*", () => {
      const cats = extractCategories({
        SellsArtbook: true,
        SellsGoods: true,
        SellsComic: false,
        SellsGame: "true"
      });
      expect(cats).toContain("Artbook");
      expect(cats).toContain("Merchandise/Goods");
      expect(cats).toContain("Game");
      expect(cats).not.toContain("Comic/Doujinshi");
    });
  });

  describe("generateUniqueCircleSlug", () => {
    it("membuat slug dasar jika belum ada di set", () => {
      const existing = new Set<string>();
      const slug = generateUniqueCircleSlug("Atelier Hanami", "A-15a", existing);
      expect(slug).toBe("atelier-hanami");
      expect(existing.has("atelier-hanami")).toBe(true);
    });

    it("menambahkan kode booth jika terjadi tabrakan nama", () => {
      const existing = new Set<string>(["atelier-hanami"]);
      const slug = generateUniqueCircleSlug("Atelier Hanami", "A-15a", existing);
      expect(slug).toBe("atelier-hanami-a-15a");
      expect(existing.has("atelier-hanami-a-15a")).toBe(true);
    });

    it("menangani nama non-latin / simbol", () => {
      const existing = new Set<string>();
      const slug = generateUniqueCircleSlug("★★★", "B-02", existing);
      expect(slug).toBe("circle-b-02");
    });
  });

  describe("matchFloorMap", () => {
    const mockMaps = [
      { id: "map-8", name: "Hall 8 - Artist Alley (Blok A-M)", hall: "Hall 8" },
      { id: "map-9", name: "Hall 9 - Creators & Corporate (Blok N-Z)", hall: "Hall 9" }
    ];

    it("mencocokkan Blok A-M ke Hall 8", () => {
      const res = matchFloorMap(mockMaps, "A-15a");
      expect(res?.id).toBe("map-8");
      const resM = matchFloorMap(mockMaps, "M-22b");
      expect(resM?.id).toBe("map-8");
    });

    it("mencocokkan Blok N-Z dan TC ke Hall 9", () => {
      const resN = matchFloorMap(mockMaps, "N-01");
      expect(resN?.id).toBe("map-9");
      const resTC = matchFloorMap(mockMaps, "TC-12");
      expect(resTC?.id).toBe("map-9");
    });

    it("memprioritaskan hall eksplisit jika diberikan", () => {
      const res = matchFloorMap(mockMaps, "A-15a", "Hall 9");
      expect(res?.id).toBe("map-9");
    });
  });

  describe("buildCircleNotes", () => {
    it("menyusun catatan circle dengan metadata lengkap", () => {
      const notes = buildCircleNotes({
        boothCode: "A-10",
        dayStr: "Day 1",
        fandom: "Original",
        otherFandom: "Hololive",
        rating: "M",
        categories: ["Artbook", "Goods"],
        circleCutUrl: "https://example.com/cut.jpg",
        otherSocials: ["https://instagram.com/test"]
      });

      expect(notes).toContain("Booth: A-10 (Day 1)");
      expect(notes).toContain("Fandom: Original (Hololive)");
      expect(notes).toContain("Rating: Mature (18+)");
      expect(notes).toContain("Kategori: Artbook, Goods");
      expect(notes).toContain("Circle Cut: https://example.com/cut.jpg");
      expect(notes).toContain("https://instagram.com/test");
    });
  });

  describe("normalizeComifuroItem", () => {
    it("menolak item tanpa circle_code", () => {
      const res = normalizeComifuroItem({ name: "Circle Tanpa Booth" });
      expect(res).toBeNull();
    });

    it("menormalisasi item lengkap dengan benar", () => {
      const item = normalizeComifuroItem({
        circle_code: "A-15a",
        name: "Atelier Hanami",
        circle_cut: "https://example.com/cut.jpg",
        fandom: "Original",
        other_fandom: "Hololive",
        day: "Day 1",
        rating: "GA",
        circle_twitter: "https://twitter.com/atelierhanami",
        circle_instagram: "@atelierhanami",
        sampleworks_images: ["https://example.com/sample1.jpg"],
        SellsArtbook: true,
        SellsGoods: true
      });

      expect(item).not.toBeNull();
      expect(item?.boothCode).toBe("A-15a");
      expect(item?.name).toBe("Atelier Hanami");
      expect(item?.day).toBe("DAY_1");
      expect(item?.primarySocial).toBe("https://twitter.com/atelierhanami");
      expect(item?.sampleworks).toHaveLength(1);
      expect(item?.notes).toContain("Booth: A-15a (Day 1)");
      expect(item?.notes).toContain("Fandom: Original (Hololive)");
      expect(item?.notes).toContain("Rating: General (GA)");
      expect(item?.notes).toContain("Kategori: Artbook, Merchandise/Goods");
    });
  });
});
