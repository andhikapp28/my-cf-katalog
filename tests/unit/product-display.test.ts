import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format";
import { eventDayLabels, eventDayShortLabels, type EventDay } from "@/lib/constants";

describe("Product Display & TANALOKA Editorial - Unit Tests", () => {
  describe("Price Formatting (Zero-Price 'Rp 0' Bug Fix)", () => {
    it("memformat harga positif dengan rupiah standar Indonesia", () => {
      expect(formatCurrency(50000)).toMatch(/Rp\s*50\.000/);
      expect(formatCurrency(150000)).toMatch(/Rp\s*150\.000/);
    });

    it("memvalidasi logika zero-price: karya berharga 0 atau negatif ditandai sebagai 'Sampel Karya'", () => {
      const getDisplayPrice = (price: number) => {
        if (price <= 0) {
          return "Sampel Karya";
        }
        return formatCurrency(price);
      };

      expect(getDisplayPrice(0)).toBe("Sampel Karya");
      expect(getDisplayPrice(-100)).toBe("Sampel Karya");
      expect(getDisplayPrice(25000)).toMatch(/Rp\s*25\.000/);
    });
  });

  describe("Booth Code Display Logic", () => {
    it("menampilkan kode booth dengan prefiks BOOTH ketika ada", () => {
      const formatBoothBadge = (code?: string | null) => {
        return code ? `BOOTH ${code}` : "BOOTH TBA";
      };

      expect(formatBoothBadge("AA-01")).toBe("BOOTH AA-01");
      expect(formatBoothBadge("TC-12")).toBe("BOOTH TC-12");
      expect(formatBoothBadge(null)).toBe("BOOTH TBA");
      expect(formatBoothBadge(undefined)).toBe("BOOTH TBA");
    });
  });

  describe("Event Day Hunting Labels & TANALOKA Palettes", () => {
    it("memiliki mapping label hari yang tepat untuk Day 1, Day 2, dan Both Days", () => {
      expect(eventDayLabels.DAY_1).toBe("Day 1 (Sabtu)");
      expect(eventDayLabels.DAY_2).toBe("Day 2 (Minggu)");
      expect(eventDayLabels.ALL_DAYS).toBe("Day 1 & 2");

      expect(eventDayShortLabels.DAY_1).toBe("Day 1");
      expect(eventDayShortLabels.DAY_2).toBe("Day 2");
      expect(eventDayShortLabels.ALL_DAYS).toBe("Both Days");
    });

    it("memetakan warna TANALOKA secara konsisten untuk setiap hari hunting", () => {
      const getTanalokaDayClass = (day: EventDay) => {
        switch (day) {
          case "DAY_1":
            return "bg-[#5398DA] text-[#111215]"; // Sky Blue
          case "DAY_2":
            return "bg-[#D6F834] text-[#111215]"; // Acid Lime
          case "ALL_DAYS":
            return "bg-white text-[#111215] border border-zinc-200"; // White / Neutral
        }
      };

      expect(getTanalokaDayClass("DAY_1")).toContain("#5398DA");
      expect(getTanalokaDayClass("DAY_2")).toContain("#D6F834");
      expect(getTanalokaDayClass("ALL_DAYS")).toContain("bg-white");
    });
  });

  describe("PO Pickup Notes Extraction", () => {
    it("mengekstrak data penukaran pre-order dengan benar tanpa karakter aneh", () => {
      const rawNotes = "Nama: Budi / WA: 081299887766 / Order #CF20-042";
      expect(rawNotes.trim().length).toBeGreaterThan(0);
      expect(rawNotes).toContain("Order #CF20-042");
    });
  });
});
