import { describe, expect, it } from "vitest";
import { parseCircleNotes } from "@/lib/floor-map";
import {
  compareBoothCodes,
  getCirclePrimaryBoothCode,
  sortCirclesByBooth
} from "@/db/queries";

describe("Circle Catalog - Parser & Natural Booth Sorting", () => {
  describe("parseCircleNotes - Circle Metadata Parser", () => {
    it("mengekstrak fandom, rating, circle cut, kategori, media sosial, dan deskripsi dengan benar", () => {
      const notes = [
        "Booth: AA-01 (Both Days)",
        "Fandom: Genshin Impact (Honkai Star Rail)",
        "Rating: Mature (18+)",
        "Kategori: Artbook, Merchandise/Goods",
        "Circle Cut: https://example.com/cut.jpg",
        "X/Twitter: https://x.com/atelier_hanami",
        "Instagram: https://instagram.com/atelier_hanami",
        "Bio: Ilustrator spesialis anime fantasy & fanart"
      ].join("\n");

      const meta = parseCircleNotes(notes, "https://x.com/atelier_hanami");

      expect(meta.fandom).toBe("Genshin Impact (Honkai Star Rail)");
      expect(meta.rating).toBe("M");
      expect(meta.circleCutUrl).toBe("https://example.com/cut.jpg");
      expect(meta.categories).toEqual(["Artbook", "Merchandise/Goods"]);
      expect(meta.description).toContain("Ilustrator spesialis anime fantasy & fanart");

      // Verifikasi deduplikasi media sosial: link primary sama dengan yang di notes
      const twitterLinks = meta.socialLinks.filter((s) => s.platform === "twitter");
      expect(twitterLinks).toHaveLength(1);
      expect(meta.socialLinks.some((s) => s.platform === "instagram")).toBe(true);
    });

    it("memetakan berbagai format rating usia (M, PG, GA)", () => {
      expect(parseCircleNotes("Rating: 18+").rating).toBe("M");
      expect(parseCircleNotes("Rating: Mature").rating).toBe("M");
      expect(parseCircleNotes("Rating: R-18").rating).toBe("M");
      expect(parseCircleNotes("Rating: PG-13").rating).toBe("PG");
      expect(parseCircleNotes("Rating: PG").rating).toBe("PG");
      expect(parseCircleNotes("Rating: All Ages").rating).toBe("GA");
      expect(parseCircleNotes("Rating: General Audience").rating).toBe("GA");
      expect(parseCircleNotes("").rating).toBe("GA");
    });

    it("mengabaikan placeholder fandom berupa tanda strip atau kosong", () => {
      expect(parseCircleNotes("Fandom: -").fandom).toBeNull();
      expect(parseCircleNotes("Fandom: (-)").fandom).toBeNull();
      expect(parseCircleNotes("").fandom).toBeNull();
      expect(parseCircleNotes(null).fandom).toBeNull();
    });

    it("menangani input notes null, undefined, atau string kosong secara graceful", () => {
      const emptyFromNull = parseCircleNotes(null, null);
      expect(emptyFromNull.fandom).toBeNull();
      expect(emptyFromNull.rating).toBe("GA");
      expect(emptyFromNull.circleCutUrl).toBeNull();
      expect(emptyFromNull.categories).toEqual([]);
      expect(emptyFromNull.socialLinks).toEqual([]);
      expect(emptyFromNull.description).toBeNull();

      const emptyFromEmptyStr = parseCircleNotes("", "");
      expect(emptyFromEmptyStr.fandom).toBeNull();
      expect(emptyFromEmptyStr.socialLinks).toEqual([]);
    });

    it("memastikan tidak ada properti rush pada hasil parser", () => {
      const notes = [
        "Fandom: Bocchi the Rock!",
        "Rating: GA",
        "Circle Cut: https://example.com/btr.png"
      ].join("\n");

      const meta = parseCircleNotes(notes);
      expect(meta).not.toHaveProperty("isRush");
      expect(meta).not.toHaveProperty("rush");
    });
  });

  describe("compareBoothCodes - Natural Booth Code Sorting", () => {
    it("mengurutkan nomor booth pada lorong tunggal secara numerik (A-01 sebelum A-02 sebelum A-10)", () => {
      expect(compareBoothCodes("A-01", "A-02")).toBeLessThan(0);
      expect(compareBoothCodes("A-02", "A-10")).toBeLessThan(0);
      expect(compareBoothCodes("A-10", "A-02")).toBeGreaterThan(0);
    });

    it("mengurutkan lorong secara natural (A-10 sebelum AA-01 sebelum B-01)", () => {
      expect(compareBoothCodes("A-10", "AA-01")).toBeLessThan(0);
      expect(compareBoothCodes("AA-01", "AA-02")).toBeLessThan(0);
      expect(compareBoothCodes("AA-01", "B-01")).toBeLessThan(0);
      expect(compareBoothCodes("B-05", "TC-01")).toBeLessThan(0);
    });

    it("mengurutkan sub-meja atau suffix huruf secara tepat (A-01 sebelum A-01a sebelum A-01b)", () => {
      expect(compareBoothCodes("A-01", "A-01a")).toBeLessThan(0);
      expect(compareBoothCodes("A-01a", "A-01b")).toBeLessThan(0);
      expect(compareBoothCodes("A-01b", "A-02")).toBeLessThan(0);
    });

    it("mengembalikan 0 untuk kode booth yang identik (case insensitive)", () => {
      expect(compareBoothCodes("A-01", "A-01")).toBe(0);
      expect(compareBoothCodes("aa-10", "AA-10")).toBe(0);
      expect(compareBoothCodes("", "")).toBe(0);
      expect(compareBoothCodes(null, null)).toBe(0);
    });

    it("menempatkan booth kosong, whitespace, atau null di urutan paling akhir", () => {
      expect(compareBoothCodes("", "A-01")).toBeGreaterThan(0);
      expect(compareBoothCodes("A-01", "")).toBeLessThan(0);
      expect(compareBoothCodes(null, "A-01")).toBeGreaterThan(0);
      expect(compareBoothCodes("A-01", null)).toBeLessThan(0);
      expect(compareBoothCodes(undefined, "B-02")).toBeGreaterThan(0);
      expect(compareBoothCodes("   ", "B-02")).toBeGreaterThan(0);
    });

    it("mengurutkan array kode booth acak ke dalam urutan natural standar Comifuro", () => {
      const messyList = [
        "TC-02",
        "B-05",
        "A-10",
        "",
        "A-01",
        "AA-01",
        "A-02",
        "A-01b",
        "AA-02",
        "A-01a"
      ];

      const sorted = [...messyList].sort(compareBoothCodes);

      expect(sorted).toEqual([
        "A-01",
        "A-01a",
        "A-01b",
        "A-02",
        "A-10",
        "AA-01",
        "AA-02",
        "B-05",
        "TC-02",
        ""
      ]);
    });
  });

  describe("sortCirclesByBooth & getCirclePrimaryBoothCode", () => {
    it("mengekstrak booth code terendah sebagai primary booth code jika circle punya banyak booth", () => {
      const circleMulti = {
        name: "Circle Multi",
        boothLocations: [{ boothCode: "B-02" }, { boothCode: "A-01" }, { boothCode: "A-15" }]
      };
      expect(getCirclePrimaryBoothCode(circleMulti)).toBe("A-01");

      const circleDirect = {
        name: "Circle Direct",
        boothCode: "AA-05",
        boothLocations: []
      };
      expect(getCirclePrimaryBoothCode(circleDirect)).toBe("AA-05");

      const circleNoBooth = {
        name: "Circle No Booth",
        boothLocations: []
      };
      expect(getCirclePrimaryBoothCode(circleNoBooth)).toBe("");
    });

    it("mengurutkan daftar circle secara natural berdasarkan kode booth-nya", () => {
      const sampleCircles = [
        { name: "Circle Zebra", boothLocations: [{ boothCode: "B-05" }] },
        { name: "Circle Fox", boothLocations: [{ boothCode: "A-10" }] },
        { name: "Circle Apple", boothLocations: [{ boothCode: "A-01" }] },
        { name: "Circle Cat", boothLocations: [{ boothCode: "AA-01" }] },
        { name: "Circle Bear", boothLocations: [{ boothCode: "A-02" }] },
        { name: "Circle Ghost", boothLocations: [] }
      ];

      const sorted = sortCirclesByBooth(sampleCircles);

      expect(sorted.map((c) => c.name)).toEqual([
        "Circle Apple", // A-01
        "Circle Bear",  // A-02
        "Circle Fox",   // A-10
        "Circle Cat",   // AA-01
        "Circle Zebra", // B-05
        "Circle Ghost"  // (no booth -> di akhir)
      ]);
    });

    it("menggunakan nama circle A-Z sebagai penentu jika kode booth sama atau keduanya tanpa booth", () => {
      const sharedBoothCircles = [
        { name: "Zeta Studio", boothLocations: [{ boothCode: "A-01" }] },
        { name: "Alpha Works", boothLocations: [{ boothCode: "A-01" }] },
        { name: "Yuki Art", boothLocations: [] },
        { name: "Delta Craft", boothLocations: [] }
      ];

      const sorted = sortCirclesByBooth(sharedBoothCircles);

      expect(sorted.map((c) => c.name)).toEqual([
        "Alpha Works", // A-01 (A sebelum Z)
        "Zeta Studio", // A-01
        "Delta Craft", // No booth (D sebelum Y)
        "Yuki Art"     // No booth
      ]);
    });
  });
});
