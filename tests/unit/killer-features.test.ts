import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WishlistCashCalculator } from "@/components/wishlist/wishlist-cash-calculator";
import type { CatalogCircle } from "@/db/queries";

const MOCK_SAVED_CIRCLES: CatalogCircle[] = [
  {
    id: "circle-1",
    name: "Circle Alpha",
    slug: "circle-alpha",
    fandom: "Blue Archive",
    boothCode: "AA-01",
    day: "DAY_1",
    dayLabel: "Sabtu (Day 1)",
    sampleWorks: [],
    socialLinks: [],
    categories: [],
    metadata: {
      socialLinks: [],
      fandom: "Blue Archive",
      categories: [],
      rating: "GA",
      circleCutUrl: null,
      description: null
    },
    boothLocations: [],
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: null,
    socialLink: null
  },
  {
    id: "circle-2",
    name: "Circle Beta",
    slug: "circle-beta",
    fandom: "Genshin Impact",
    boothCode: "BB-02",
    day: "ALL_DAYS",
    dayLabel: "2 Hari Penuh",
    sampleWorks: [],
    socialLinks: [],
    categories: [],
    metadata: {
      socialLinks: [],
      fandom: "Genshin Impact",
      categories: [],
      rating: "GA",
      circleCutUrl: null,
      description: null
    },
    boothLocations: [],
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: null,
    socialLink: null
  }
];

describe("Killer Features Suite (Fase 3)", () => {
  describe("1. WishlistCashCalculator", () => {
    it("tidak merender apa pun jika savedCircles kosong", () => {
      const html = renderToString(
        React.createElement(WishlistCashCalculator, {
          savedCircles: []
        })
      );
      expect(html).toBe("");
    });

    it("merender kalkulator dengan estimasi belanja, buffer taktis, dan denominasi ATM", () => {
      const html = renderToString(
        React.createElement(WishlistCashCalculator, {
          savedCircles: MOCK_SAVED_CIRCLES,
          activeEventName: "Comic Frontier 22"
        })
      );

      // Judul & Badge
      expect(html).toContain("KALKULATOR TARIK TUNAI");
      expect(html).toContain("ANTI SINYAL BLACKOUT");
      expect(html).toContain("Circle Tersimpan");

      // Presets & breakdown
      expect(html).toContain("Ringan");
      expect(html).toContain("Standar");
      expect(html).toContain("Kolektor");
      expect(html).toContain("Borong");

      // Perhitungan default: 2 circle * Rp 75.000 = Rp 150.000 merch
      // Buffer 15% = Rp 22.500
      // Subtotal = Rp 172.500 -> dibulatkan ke kelipatan 50.000 = Rp 200.000 (2 lembar 100k)
      expect(html).toContain("REKOMENDASI TARIK TUNAI ATM");
      expect(html).toContain("200.000");
      expect(html).toContain("lembar Rp 100.000");

      // Action buttons & notice
      expect(html).toContain("Salin Rencana Budget ATM");
      expect(html).toContain("Kenapa uang tunai wajib dipersiapkan sebelum masuk ICE BSD?");
    });
  });
});
