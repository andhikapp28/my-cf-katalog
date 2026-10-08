import { describe, expect, it } from "vitest";
import {
  calculateAtmCashReadiness,
  calculateWishlistSummary,
  compareBoothOrder,
  type WishlistProductItem
} from "@/lib/wishlist";
import { generateWishlistSummaryText } from "@/components/wishlist/share-wishlist-modal";
import type { BoothGroup } from "@/components/wishlist/types";

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
      expect(res.notes50k).toBe(7); // 350.000 / 50.000 = 7 lembar
      expect(res.notes100k).toBe(4); // 350.000 / 100.000 = 4 lembar (400.000)
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

  describe("generateWishlistSummaryText (Share format)", () => {
    it("menghasilkan teks terformat rapi untuk share WA/Twitter", () => {
      const sampleGroups: BoothGroup[] = [
        {
          circleId: "c-1",
          circleName: "Circle Alpha",
          boothCode: "A-15a",
          hall: "Hall 8",
          floorMapId: "map-1",
          allPurchased: false,
          hasRush: true,
          items: [
            {
              id: "p-1",
              name: "Artbook Illust Vol 1",
              price: 100000,
              quantity: 1,
              priority: "HIGH",
              status: "TARGET",
              targetDay: "DAY_1",
              isRush: true,
              purchaseType: "ON_THE_SPOT",
              productLink: null,
              poDeadline: null,
              poPickupNotes: null,
              notes: null,
              circleId: "c-1",
              circleName: "Circle Alpha",
              eventId: "ev-1",
              eventName: "Comic Frontier 19",
              boothCode: "A-15a",
              hall: "Hall 8",
              floorMapId: "map-1",
              imageUrl: null
            }
          ]
        }
      ];

      const summary = calculateWishlistSummary([
        {
          id: "p-1",
          price: 100000,
          quantity: 1,
          purchaseType: "ON_THE_SPOT",
          isPurchased: false
        }
      ]);

      const text = generateWishlistSummaryText({
        eventName: "Comic Frontier 19",
        boothGroups: sampleGroups,
        summary,
        purchasedIds: new Set<string>()
      });

      expect(text).toContain("MY COMIPOCKET - WISHLIST & HUNTING CHECKLIST");
      expect(text).toContain("Comic Frontier 19");
      expect(text).toContain("[Hall 8 · Booth A-15a] Circle Alpha");
      expect(text).toContain("Artbook Illust Vol 1");
      expect(text).toContain("RUSH 10:00");
      expect(text).toContain("https://comipocket.app/wishlist");
    });
  });
});
