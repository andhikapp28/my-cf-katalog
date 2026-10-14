import { describe, expect, it } from "vitest";
import {
  calculateAtmCashReadiness,
  compareBoothOrder
} from "@/lib/wishlist";
import { generateSavedCirclesShareText } from "@/components/wishlist/share-wishlist-modal";
import type { CatalogCircle } from "@/db/queries";

describe("Wishlist Page & Helpers - Unit Tests", () => {
  describe("compareBoothOrder (Hall and Table natural sorting)", () => {
    it("mengurutkan Hall numerik secara tepat (Hall 8 sebelum Hall 9 sebelum Hall 10)", () => {
      const b8 = { hall: "Hall 8", boothCode: "A-01" };
      const b9 = { hall: "Hall 9", boothCode: "A-01" };
      const b10 = { hall: "Hall 10", boothCode: "A-01" };

      expect(compareBoothOrder(b8, b9)).toBeLessThan(0);
      expect(compareBoothOrder(b9, b10)).toBeLessThan(0);
      expect(compareBoothOrder(b8, b10)).toBeLessThan(0);
    });

    it("mengurutkan lorong/meja secara natural di Hall yang sama (A-01, A-02, A-15a, B-01)", () => {
      const a1 = { hall: "Hall 8", boothCode: "A-01" };
      const a2 = { hall: "Hall 8", boothCode: "A-02" };
      const a15a = { hall: "Hall 8", boothCode: "A-15a" };
      const b1 = { hall: "Hall 8", boothCode: "B-01" };

      expect(compareBoothOrder(a1, a2)).toBeLessThan(0);
      expect(compareBoothOrder(a2, a15a)).toBeLessThan(0);
      expect(compareBoothOrder(a15a, b1)).toBeLessThan(0);
    });
  });

  describe("calculateAtmCashReadiness", () => {
    it("menghitung kekurangan uang tunai dan pecahan ATM ICE BSD", () => {
      const res = calculateAtmCashReadiness(450000, 100000);
      expect(res.requiredCash).toBe(450000);
      expect(res.cashInHand).toBe(100000);
      expect(res.shortfall).toBe(350000);
      expect(res.notes50k).toBe(7);
      expect(res.notes100k).toBe(4);
      expect(res.isSufficient).toBe(false);
    });

    it("memberikan status cukup jika uang di dompet sudah melebihi target", () => {
      const res = calculateAtmCashReadiness(150000, 200000);
      expect(res.shortfall).toBe(0);
      expect(res.notes50k).toBe(0);
      expect(res.notes100k).toBe(0);
      expect(res.isSufficient).toBe(true);
    });
  });

  describe("generateSavedCirclesShareText (Share format)", () => {
    it("menghasilkan teks terformat rapi untuk share WA/Twitter", () => {
      const sampleCircles = [
        {
          id: "c-1",
          name: "Circle Alpha",
          boothCode: "A-15a",
          day: "DAY_1",
          fandom: "Original, Hololive"
        },
        {
          id: "c-2",
          name: "Circle Beta",
          boothCode: "C-02b",
          day: "DAY_2",
          fandom: "Genshin Impact"
        }
      ] as unknown as CatalogCircle[];

      const text = generateSavedCirclesShareText({
        eventName: "Comic Frontier 22",
        circles: sampleCircles
      });

      expect(text).toContain("DAFTAR CIRCLE INCARAN SAYA");
      expect(text).toContain("Comic Frontier 22");
      expect(text).toContain("[Booth A-15a · Day 1 (Sabtu)] Circle Alpha");
      expect(text).toContain("Original, Hololive");
      expect(text).toContain("[Booth C-02b · Day 2 (Minggu)] Circle Beta");
      expect(text).toContain("ComiPocket");
    });
  });
});
