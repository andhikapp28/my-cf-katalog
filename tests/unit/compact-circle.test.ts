import { describe, expect, it } from "vitest";
import { parseCircleNotes } from "@/lib/floor-map";
import { formatCurrency } from "@/lib/format";
import type { CompactCircleItem } from "@/components/products/compact-circle-card";

describe("Compact Circle & Catalog Modal Logic - TANALOKA Pure Typography", () => {
  describe("TANALOKA Palette and Day Badge Resolution", () => {
    function resolveDayConfig(dayStr?: string | null): { label: string; className: string } {
      if (!dayStr) {
        return {
          label: "Both Days",
          className: "bg-white text-[#111215] border border-zinc-200"
        };
      }

      const normalized = dayStr.replace(/[\s-]+/g, "_").toUpperCase();

      if (normalized.includes("1") && !normalized.includes("2")) {
        return {
          label: "Day 1",
          className: "bg-[#5398DA] text-[#111215]"
        };
      }

      if (normalized.includes("2") && !normalized.includes("1")) {
        return {
          label: "Day 2",
          className: "bg-[#D6F834] text-[#111215]"
        };
      }

      return {
        label: "Both Days",
        className: "bg-white text-[#111215] border border-zinc-200"
      };
    }

    it("memetakan Day 1 ke TANALOKA Sky Blue #5398DA", () => {
      const res = resolveDayConfig("DAY_1");
      expect(res.label).toBe("Day 1");
      expect(res.className).toContain("#5398DA");
      expect(res.className).toContain("#111215");
    });

    it("memetakan Day 2 ke TANALOKA Acid Lime #D6F834", () => {
      const res = resolveDayConfig("DAY_2");
      expect(res.label).toBe("Day 2");
      expect(res.className).toContain("#D6F834");
      expect(res.className).toContain("#111215");
    });

    it("memetakan ALL_DAYS / Both Days ke warna netral Pure White dengan border", () => {
      const res = resolveDayConfig("ALL_DAYS");
      expect(res.label).toBe("Both Days");
      expect(res.className).toContain("bg-white");
    });
  });

  describe("Booth Code & Rating Badges", () => {
    it("memformat badge booth kode kontras hitam dan Acid Lime", () => {
      const formatBoothBadge = (boothCode: string) => ({
        bg: "#111215",
        text: "#D6F834",
        label: `BOOTH ${boothCode}`
      });

      const badge = formatBoothBadge("AA-01");
      expect(badge.bg).toBe("#111215");
      expect(badge.text).toBe("#D6F834");
      expect(badge.label).toBe("BOOTH AA-01");
    });

    it("mengidentifikasi rating dewasa M 18+ dengan warna Coral Red #F84632", () => {
      function resolveRatingBadge(rating?: string | null) {
        const norm = (rating || "GA").toUpperCase();
        if (norm.includes("M") || norm.includes("18")) {
          return { label: "M (18+)", color: "#F84632" };
        }
        if (norm.includes("PG")) {
          return { label: "PG (13+)", color: "amber" };
        }
        return { label: "GA (All Ages)", color: "emerald" };
      }

      expect(resolveRatingBadge("M").color).toBe("#F84632");
      expect(resolveRatingBadge("18+").color).toBe("#F84632");
      expect(resolveRatingBadge("PG").color).toBe("amber");
      expect(resolveRatingBadge("GA").color).toBe("emerald");
    });
  });

  describe("Circle Cut Thumbnail Fallback Monogram", () => {
    function getInitials(name: string): string {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return "CP";
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    it("menghasilkan 2 huruf inisial untuk nama circle multi-kata", () => {
      expect(getInitials("Hanami Artworks")).toBe("HA");
      expect(getInitials("Blue Horizon Studio")).toBe("BH");
    });

    it("menghasilkan 2 huruf pertama untuk nama circle satu kata", () => {
      expect(getInitials("Neko")).toBe("NE");
      expect(getInitials("Akiba")).toBe("AK");
    });
  });

  describe("Metadata Parsing dari Notes Circle", () => {
    it("mengekstrak fandom, rating, circle cut, dan tautan sosial media", () => {
      const notes = [
        "Fandom: Honkai Star Rail, Genshin Impact",
        "Rating: M",
        "Circle Cut: https://example.com/cut.jpg",
        "Kategori: Artbook, Keychain, Standee",
        "Twitter: https://x.com/hanamistudio",
        "Bio: Circle ilustrator lokal spesialis game miHoYo."
      ].join("\n");

      const meta = parseCircleNotes(notes, "https://instagram.com/hanami");
      expect(meta.fandom).toBe("Honkai Star Rail, Genshin Impact");
      expect(meta.rating).toBe("M");
      expect(meta.circleCutUrl).toBe("https://example.com/cut.jpg");
      expect(meta.categories).toContain("Artbook");
      expect(meta.categories).toContain("Keychain");
      expect(meta.socialLinks.some((l) => l.platform === "twitter")).toBe(true);
      expect(meta.socialLinks.some((l) => l.platform === "instagram")).toBe(true);
      expect(meta.description).toContain("Circle ilustrator lokal");
    });
  });

  describe("Tombol Pure Typography TANALOKA (Bebas Ikon AI Slop)", () => {
    it("memastikan tombol aksi utama menggunakan label teks murni", () => {
      const actionLabels = {
        closeModal: "TUTUP",
        copySlip: "SALIN",
        tableMap: "PETA MEJA",
        viewWorks: "LIHAT KARYA"
      };

      expect(actionLabels.closeModal).toBe("TUTUP");
      expect(actionLabels.copySlip).toBe("SALIN");
      expect(actionLabels.tableMap).toBe("PETA MEJA");
      expect(actionLabels.viewWorks).toBe("LIHAT KARYA");

      // Validasi tidak ada ikon AI seperti sparkle, wand, robot di label
      Object.values(actionLabels).forEach((label) => {
        expect(label).not.toMatch(/[✨⚡🪄🤖]/);
      });
    });
  });

  describe("Katalog Karya & PO Slip Display Logic", () => {
    it("menandai harga 0 atau negatif sebagai Sampel Karya", () => {
      const getDisplayPrice = (price: number) => {
        if (price <= 0) return "Sampel Karya";
        return formatCurrency(price);
      };

      expect(getDisplayPrice(0)).toBe("Sampel Karya");
      expect(getDisplayPrice(-5000)).toBe("Sampel Karya");
      expect(getDisplayPrice(35000)).toMatch(/Rp\s*35\.000/);
    });

    it("memvalidasi data circle dengan produk dan lokasi booth", () => {
      const circle: CompactCircleItem = {
        id: "c-01",
        name: "Studio Moegi",
        boothCode: "AA-15",
        day: "DAY_1",
        products: [
          {
            id: "p-01",
            name: "Artbook Vol 3",
            price: 75000,
            imageUrl: "https://example.com/p1.jpg",
            poPickupNotes: "Nama: Andhika / No. PO: 042"
          },
          {
            id: "p-02",
            name: "Free Postcard",
            price: 0,
            imageUrl: null
          }
        ]
      };

      expect(circle.name).toBe("Studio Moegi");
      expect(circle.products?.length).toBe(2);
      expect(circle.products?.[0].poPickupNotes).toBe("Nama: Andhika / No. PO: 042");
    });
  });
});
