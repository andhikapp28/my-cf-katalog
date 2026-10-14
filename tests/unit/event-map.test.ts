import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ICE_BSD_HALLS,
  CF23_COMMUNITY_ZONES,
  detectBoothHall,
  getBoothMasterCoordinates,
  getHallBounds,
  clampScale,
  computeFocalTranslate
} from "@/lib/floor-map";
import { MapControls } from "@/components/map/map-controls";
import { CircleDrawer } from "@/components/map/circle-drawer";

describe("Interactive Event Map Logic & Helpers", () => {
  it("ICE_BSD_HALLS mendefinisikan layout Hall 5 sampai Hall 10 secara lengkap", () => {
    expect(ICE_BSD_HALLS).toHaveLength(6);

    const hallNames = ICE_BSD_HALLS.map((h) => h.name);
    expect(hallNames).toEqual([
      "Hall 5",
      "Hall 6",
      "Hall 7",
      "Hall 8",
      "Hall 9",
      "Hall 10"
    ]);

    // Hall 5 untuk komunitas kreatif & game dev
    const hall5 = ICE_BSD_HALLS.find((h) => h.name === "Hall 5");
    expect(hall5).toBeDefined();
    expect(hall5?.title).toContain("Community");
    expect(hall5?.x).toBe(60);
    expect(hall5?.width).toBe(360);

    // Hall 6 untuk F&B dan Stage
    const hall6 = ICE_BSD_HALLS.find((h) => h.name === "Hall 6");
    expect(hall6).toBeDefined();
    expect(hall6?.title).toContain("Stage");
    expect(hall6?.x).toBe(440);

    // Hall 8 untuk Artist Alley
    const hall8 = ICE_BSD_HALLS.find((h) => h.name === "Hall 8");
    expect(hall8?.title).toContain("Artist Alley");
    expect(hall8?.x).toBe(1200);

    // Hall 10 untuk Ticketing & Shuttle
    const hall10 = ICE_BSD_HALLS.find((h) => h.name === "Hall 10");
    expect(hall10?.title).toContain("Shuttle");
    expect(hall10?.x).toBe(1960);
  });

  it("getHallBounds mengembalikan bounding box yang valid dalam koordinat canvas master", () => {
    const bounds5 = getHallBounds("Hall 5");
    expect(bounds5).toEqual({ x: 60, y: 120, width: 360, height: 780 });

    const bounds8 = getHallBounds("Hall 8");
    expect(bounds8).toEqual({ x: 1200, y: 120, width: 360, height: 780 });

    const notFound = getHallBounds("Hall 99");
    expect(notFound).toBeNull();
  });

  it("detectBoothHall mendeteksi hall penempatan booth secara akurat", () => {
    expect(detectBoothHall("FC-01")).toBe("Hall 5");
    expect(detectBoothHall("IG-04")).toBe("Hall 5");
    expect(detectBoothHall("STG-01")).toBe("Hall 6");
    expect(detectBoothHall("AA-01")).toBe("Hall 8");
    expect(detectBoothHall("A-15")).toBe("Hall 8");
    expect(detectBoothHall("M-40")).toBe("Hall 8");
    expect(detectBoothHall("N-01")).toBe("Hall 9");
    expect(detectBoothHall("TC-12")).toBe("Hall 9");
    expect(detectBoothHall("Z-10")).toBe("Hall 9");

    // Menghargai preferensi defaultHall jika diberikan
    expect(detectBoothHall("A-01", "Hall 7")).toBe("Hall 7");
  });

  it("getBoothMasterCoordinates memetakan booth ke dalam koordinat master SVG viewBox (2400 x 1200)", () => {
    // AA-01 di Hall 8 (x: 1200 s/d 1560, y: 120 s/d 900)
    const aa1 = getBoothMasterCoordinates("AA-01", "Hall 8");
    expect(aa1.hall).toBe("Hall 8");
    expect(aa1.x).toBeGreaterThan(1200);
    expect(aa1.x).toBeLessThan(1560);
    expect(aa1.y).toBeGreaterThan(120);
    expect(aa1.y).toBeLessThan(900);

    // TC-12 di Hall 9 (x: 1580 s/d 1940, y: 120 s/d 900)
    const tc12 = getBoothMasterCoordinates("TC-12", "Hall 9");
    expect(tc12.hall).toBe("Hall 9");
    expect(tc12.x).toBeGreaterThan(1580);
    expect(tc12.x).toBeLessThan(1940);
    expect(tc12.y).toBeGreaterThan(120);
    expect(tc12.y).toBeLessThan(900);
  });

  it("CF23_COMMUNITY_ZONES memuat zona esensial ICE BSD Hall 5-10", () => {
    expect(CF23_COMMUNITY_ZONES.length).toBeGreaterThanOrEqual(10);

    const codes = CF23_COMMUNITY_ZONES.map((z) => z.code);
    expect(codes).toContain("HALL 6 · MAIN STAGE");
    expect(codes).toContain("HALL 6 · FOOD COURT");
    expect(codes).toContain("HALL 10 · SHUTTLE BUS");
    expect(codes).toContain("HALL 10 · TIKET & GELANG");
    expect(codes).toContain("HALL 5 · INDIE GAME");
    expect(codes).toContain("HALL 5 · FC 01-08");

    const shuttle = CF23_COMMUNITY_ZONES.find((z) => z.code === "HALL 10 · SHUTTLE BUS");
    expect(shuttle?.description).toContain("Lorena");
    expect(shuttle?.operatingHours).toContain("07:30");
  });

  it("MapControls me-render tombol zoom in, zoom out, reset dan persentase scale", () => {
    const html = renderToStaticMarkup(
      React.createElement(MapControls, {
        scale: 1.5,
        onZoomIn: () => {},
        onZoomOut: () => {},
        onReset: () => {}
      })
    );

    expect(html).toContain("150%");
    expect(html).toContain("Perbesar");
    expect(html).toContain("Perkecil");
    expect(html).toContain("Atur ulang");
  });

  it("CircleDrawer me-render detail booth marker dengan aksesibel", () => {
    const dummyMarker = {
      id: "booth-1",
      circleId: "101",
      circleName: "Studio Sakuramochi",
      boothCode: "AA-01",
      hall: "Hall 8",
      day: "ALL_DAYS",
      dayLabel: "Both Days (Sabtu & Minggu)",
      rating: "PG",
      fandom: "Genshin Impact / Honkai Star Rail",
      description: "Artbook dan keychain akrilik",
      circleCutUrl: null,
      sampleWorks: [],
      socialLinks: [
        { platform: "twitter", url: "https://x.com/sakura", label: "X (Twitter)" }
      ],
      categories: ["Artbook", "Goods"],
      posX: 10,
      posY: 20,
      isHighlighted: false,
      isDone: false,
      hasRush: false,
      products: []
    };

    const html = renderToStaticMarkup(
      React.createElement(CircleDrawer, {
        isOpen: true,
        onClose: () => {},
        selectedMarker: dummyMarker,
        isWishlisted: false,
        onToggleWishlist: () => {}
      })
    );

    expect(html).toContain("AA-01");
    expect(html).toContain("Hall 8");
    expect(html).toContain("Studio Sakuramochi");
    expect(html).toContain("Both Days");
    expect(html).toContain("Genshin Impact");
    expect(html).toContain("Simpan ke Wishlist");
  });

  it("CircleDrawer me-render zona fasilitas komunitas dengan tombol bookmark", () => {
    const dummyZone = {
      id: "zone-shuttle",
      code: "SHUTTLE-H10",
      name: "Halte Shuttle Bus Gratis Lorena",
      hall: "Hall 10",
      category: "FACILITY" as const,
      masterX: 1980,
      masterY: 1090,
      width: 340,
      height: 70,
      description: "Shuttle bus gratis Cisauk - ICE BSD Hall 10",
      operatingHours: "07:30 - 19:30 WIB",
      tags: ["Shuttle Lorena", "Gratis"],
      isInteractive: true
    };

    const html = renderToStaticMarkup(
      React.createElement(CircleDrawer, {
        isOpen: true,
        onClose: () => {},
        selectedZone: dummyZone,
        isWishlisted: true,
        onToggleWishlist: () => {}
      })
    );

    expect(html).toContain("SHUTTLE-H10");
    expect(html).toContain("Halte Shuttle Bus Gratis Lorena");
    expect(html).toContain("07:30 - 19:30 WIB");
    expect(html).toContain("Tersimpan di Wishlist");
  });
});
