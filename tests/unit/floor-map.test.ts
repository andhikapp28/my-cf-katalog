import { describe, expect, it } from "vitest";
import {
  clampScale,
  computeFocalTranslate,
  filterCircleMarkers,
  getBoothFloorCoordinates,
  parseCircleNotes,
  pickNextBooth
} from "@/lib/floor-map";

describe("clampScale", () => {
  it("membatasi skala ke rentang MIN..MAX", () => {
    expect(clampScale(0.2)).toBe(1);
    expect(clampScale(1)).toBe(1);
    expect(clampScale(2.5)).toBe(2.5);
    expect(clampScale(10)).toBe(4);
  });
});

describe("computeFocalTranslate", () => {
  it("mempertahankan titik fokus tetap di posisi layar yang sama saat scale membesar", () => {
    // Titik fokus di tengah (100,100), scale 1 -> 2, translate awal (0,0).
    const result = computeFocalTranslate({
      focalX: 100,
      focalY: 100,
      prevScale: 1,
      nextScale: 2,
      prevTranslateX: 0,
      prevTranslateY: 0
    });

    // Verifikasi: screenPoint = translate + scale * localPoint harus tetap 100
    // untuk localPoint yang sama sebelum & sesudah.
    const localX = (100 - 0) / 1; // localPoint pada scale awal
    const screenXAfter = result.translateX + 2 * localX;
    expect(screenXAfter).toBeCloseTo(100);
  });

  it("translate tidak berubah kalau scale tidak berubah", () => {
    const result = computeFocalTranslate({
      focalX: 50,
      focalY: 50,
      prevScale: 2,
      nextScale: 2,
      prevTranslateX: -30,
      prevTranslateY: -20
    });
    expect(result.translateX).toBeCloseTo(-30);
    expect(result.translateY).toBeCloseTo(-20);
  });
});

describe("pickNextBooth", () => {
  const markers = [
    { id: "1", boothCode: "A1", isDone: false, isHighlighted: false },
    { id: "2", boothCode: "A2", isDone: false, isHighlighted: true },
    { id: "3", boothCode: "A3", isDone: true, isHighlighted: true },
    { id: "4", boothCode: "B1", isDone: false, isHighlighted: true }
  ];

  it("mengembalikan null kalau semua booth sudah selesai", () => {
    const allDone = markers.map((m) => ({ ...m, isDone: true }));
    expect(pickNextBooth(allDone)).toBeNull();
  });

  it("mengabaikan booth yang sudah selesai dari kandidat", () => {
    const result = pickNextBooth(markers);
    expect(result?.id).not.toBe("3");
  });

  it("mendahulukan booth ber-highlight sebelum booth biasa", () => {
    const result = pickNextBooth(markers);
    // Kandidat pending: 1 (A1, tidak highlight), 2 (A2, highlight), 4 (B1, highlight).
    // Highlight didahulukan, lalu urut boothCode -> A2 duluan.
    expect(result?.boothCode).toBe("A2");
  });

  it("lanjut ke booth berikutnya dari booth aktif saat ini (wrap-around)", () => {
    // Urutan pending ter-sort: A2 (highlight), B1 (highlight), A1 (non-highlight).
    const afterA2 = pickNextBooth(markers, "2");
    expect(afterA2?.boothCode).toBe("B1");

    const afterB1 = pickNextBooth(markers, "4");
    expect(afterB1?.boothCode).toBe("A1");

    const wrapAround = pickNextBooth(markers, "1");
    expect(wrapAround?.boothCode).toBe("A2");
  });

  it("mulai dari awal daftar kalau currentBoothId tidak ditemukan di kandidat (mis. baru selesai)", () => {
    const result = pickNextBooth(markers, "3");
    expect(result?.boothCode).toBe("A2");
  });
});

describe("getBoothFloorCoordinates", () => {
  it("menghitung koordinat booth Hall 8 (Island AA-AG dan Aisle A-M)", () => {
    const aa1 = getBoothFloorCoordinates("AA-01", "Hall 8");
    const c2 = getBoothFloorCoordinates("C-02b", "Hall 8");
    const m40 = getBoothFloorCoordinates("M-40", "Hall 8");

    expect(aa1.x).toBeGreaterThan(5);
    expect(aa1.x).toBeLessThan(15);
    expect(aa1.y).toBeGreaterThan(10);

    expect(c2.x).toBeGreaterThan(45);
    expect(c2.x).toBeLessThan(55);

    expect(m40.x).toBeGreaterThan(90);
  });

  it("menghitung koordinat booth Hall 9 (Aisle N-S, Z dan Corporate TC)", () => {
    const n1 = getBoothFloorCoordinates("N-01", "Hall 9");
    const tc12 = getBoothFloorCoordinates("TC-12", "Hall 9");

    expect(n1.x).toBeGreaterThan(10);
    expect(n1.x).toBeLessThan(20);

    expect(tc12.x).toBeGreaterThan(65);
    expect(tc12.x).toBeLessThan(95);
  });
});

describe("parseCircleNotes", () => {
  it("mengekstrak fandom, rating, circle cut, dan media sosial dengan benar", () => {
    const notes = [
      "Booth: AA-01 (Both Days)",
      "Fandom: Genshin Impact (Honkai Star Rail)",
      "Rating: Mature (18+)",
      "Kategori: Artbook, Merchandise/Goods",
      "Circle Cut: https://example.com/cut.jpg",
      "X/Twitter: https://x.com/hanami",
      "Instagram: https://instagram.com/hanami",
      "Bio: Ilustrator spesialis anime fantasy"
    ].join("\n");

    const meta = parseCircleNotes(notes, "https://x.com/hanami");
    expect(meta.fandom).toBe("Genshin Impact (Honkai Star Rail)");
    expect(meta.rating).toBe("M");
    expect(meta.circleCutUrl).toBe("https://example.com/cut.jpg");
    expect(meta.categories).toContain("Artbook");
    expect(meta.socialLinks.length).toBeGreaterThanOrEqual(2);
    expect(meta.description).toContain("Ilustrator spesialis anime fantasy");
  });
});

describe("filterCircleMarkers", () => {
  const sampleMarkers: import("@/lib/floor-map").CircleMarker[] = [
    {
      id: "b1",
      circleId: "c1",
      circleName: "Atelier Hanami",
      boothCode: "A-15a",
      day: "DAY_1",
      dayLabel: "Day 1 (Sabtu)",
      rating: "GA",
      fandom: "Hololive",
      description: "Artbook Holo",
      sampleWorks: [],
      socialLinks: [],
      categories: ["Artbook"],
      posX: 25,
      posY: 40,
      isHighlighted: true,
      isDone: false,
      hasRush: true,
      products: [{ id: "p1", name: "Holo Artbook", price: 150000 }]
    },
    {
      id: "b2",
      circleId: "c2",
      circleName: "Mikan Press",
      boothCode: "C-02b",
      day: "ALL_DAYS",
      dayLabel: "Both Days",
      rating: "GA",
      fandom: "Original",
      description: "Doujinshi",
      sampleWorks: [],
      socialLinks: [],
      categories: ["Comic"],
      posX: 52,
      posY: 35,
      isHighlighted: false,
      isDone: false,
      hasRush: false,
      products: []
    },
    {
      id: "b3",
      circleId: "c3",
      circleName: "Hoshizora Project",
      boothCode: "G-08",
      day: "DAY_2",
      dayLabel: "Day 2 (Minggu)",
      rating: "GA",
      fandom: "Genshin Impact",
      description: "Merchandise",
      sampleWorks: [],
      socialLinks: [],
      categories: ["Goods"],
      posX: 75,
      posY: 65,
      isHighlighted: false,
      isDone: false,
      hasRush: false,
      products: []
    }
  ];

  it("memfilter marker berdasarkan teks pencarian (nama circle / booth code / fandom)", () => {
    const byName = filterCircleMarkers(sampleMarkers, { search: "Atelier" });
    expect(byName.filtered.length).toBe(1);
    expect(byName.filtered[0].circleName).toBe("Atelier Hanami");

    const byBooth = filterCircleMarkers(sampleMarkers, { search: "C-02" });
    expect(byBooth.filtered.length).toBe(1);
    expect(byBooth.filtered[0].circleName).toBe("Mikan Press");

    const byFandom = filterCircleMarkers(sampleMarkers, { search: "Genshin" });
    expect(byFandom.filtered.length).toBe(1);
    expect(byFandom.filtered[0].circleName).toBe("Hoshizora Project");
  });

  it("memfilter marker berdasarkan hari", () => {
    const day1 = filterCircleMarkers(sampleMarkers, { dayFilter: "DAY_1" });
    expect(day1.filtered.length).toBe(2);

    const day2 = filterCircleMarkers(sampleMarkers, { dayFilter: "DAY_2" });
    expect(day2.filtered.length).toBe(2);
  });

  it("memfilter marker berdasarkan status wishlist", () => {
    const wishResult = filterCircleMarkers(sampleMarkers, {
      dayFilter: "WISHLIST",
      wishlistIds: new Set(["c1"])
    });
    expect(wishResult.filtered.length).toBe(1);
    expect(wishResult.filtered[0].circleId).toBe("c1");
  });
});

