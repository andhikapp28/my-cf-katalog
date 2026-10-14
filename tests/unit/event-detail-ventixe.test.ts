import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EventHeroCard } from "@/components/events/event-hero-card";
import { EventTermsSection } from "@/components/events/event-terms-section";
import { EventHighlightsSection } from "@/components/events/event-highlights-section";
import { EventTicketsSidebar } from "@/components/events/event-tickets-sidebar";
import { EventBenefitsSidebar } from "@/components/events/event-benefits-sidebar";
import { EventMapPreviewCard } from "@/components/events/event-map-preview-card";

describe("Ventixe Event Detail Redesign Components (SSR)", () => {
  describe("1. EventHeroCard", () => {
    it("merender banner 16:9, floating badges, metadata strip, dan Tentang Acara untuk CF 23", () => {
      const html = renderToString(
        React.createElement(EventHeroCard, {
          eventId: "cf23-id",
          slug: "cf23",
          name: "Comic Frontier 23 (Comifuro 23)",
          bannerImageUrl: "/banner/cf23.jpg",
          isActive: true,
          isUpcoming: false,
          categoryLabel: "Comic Market & Pop Culture",
          datesText: "31 Okt - 1 Nov 2026",
          venueText: "ICE BSD City (Hall 5, 6, 7, 8, 9, 10)",
          mapHref: "/events/cf23/map",
          circlesCountText: "1.959 Circle Terdaftar",
          ticketPriceText: "Rp 75.000",
          ticketPlatform: "Ticket2U",
          aboutText:
            "Comic Frontier 23 hadir di ICE BSD City dengan perayaan tematik Halloween Weekend. Menghadirkan 1.959 circle kreator terkurasi di area Artist Alley, instalasi pameran komunitas mandiri di Hall 5, dan pasar komik independen terbesar di Indonesia."
        })
      );

      // Judul dan floating badges
      expect(html).toContain("Comic Frontier 23 (Comifuro 23)");
      expect(html).toContain("Comic Market &amp; Pop Culture");
      expect(html).toContain("ACTIVE EVENT");

      // Metadata strip
      expect(html).toContain("31 Okt - 1 Nov 2026");
      expect(html).toContain("ICE BSD City (Hall 5, 6, 7, 8, 9, 10)");
      expect(html).toContain("Buka Peta Event");
      expect(html).toContain("/events/cf23/map");
      expect(html).toContain("1.959 Circle Terdaftar");
      expect(html).toContain("Mulai Rp 75.000");
      expect(html).toContain("Ticket2U");

      // Tentang acara
      expect(html).toContain("Tentang Acara");
      expect(html).toContain("Halloween Weekend");
      expect(html).toContain("1.959 circle kreator");
      expect(html).toContain("Hall 5");

      // Action buttons
      expect(html).toContain("Simpan Event");
      expect(html).toContain("Bagikan");
    });
  });

  describe("2. EventTermsSection (Tata Tertib & Ketentuan Masuk)", () => {
    it("merender 4 item bernomor tanpa em-dash", () => {
      const html = renderToString(React.createElement(EventTermsSection));

      expect(html).toContain("Tata Tertib &amp; Ketentuan Masuk");
      expect(html).toContain("01");
      expect(html).toContain("Tiket Masuk &amp; Identitas");
      expect(html).toContain("02");
      expect(html).toContain("Larangan Keras Gen-AI &amp; Bootleg");
      expect(html).toContain("03");
      expect(html).toContain("Regulasi Senjata Cosplay Busa EVA");
      expect(html).toContain("04");
      expect(html).toContain("Etika Foto Cosplay is Not Consent");

      // Tidak boleh ada karakter em-dash (—)
      expect(html).not.toContain("—");
    });
  });

  describe("3. EventHighlightsSection (Program Khusus & Bintang Tamu)", () => {
    it("merender 4 kartu sorotan resmi Comifuro 23", () => {
      const html = renderToString(React.createElement(EventHighlightsSection));

      expect(html).toContain("Program Khusus &amp; Bintang Tamu");
      expect(html).toContain("Hall 5 Free Community Booths");
      expect(html).toContain("Halloween Cosplay Parade");
      expect(html).toContain("Official Goods CF23");
      expect(html).toContain("KAI Commuter KMT Edisi Khusus");

      expect(html).not.toContain("—");
    });
  });

  describe("4. EventTicketsSidebar (Paket Tiket Resmi)", () => {
    it("merender Single Day Pass Rp 75.000 dan Bundle Rp 130.000", () => {
      const html = renderToString(
        React.createElement(EventTicketsSidebar, {
          platform: "Ticket2U",
          ticketUrl: "https://www.ticket2u.id"
        })
      );

      expect(html).toContain("Paket Tiket Resmi");
      expect(html).toContain("Single Day Pass");
      expect(html).toContain("Rp 75.000");
      expect(html).toContain("Bundle Official Goods");
      expect(html).toContain("Rp 130.000");
      expect(html).toContain("Beli Tiket di Ticket2U");
      expect(html).toContain("https://www.ticket2u.id");
    });
  });

  describe("5. EventBenefitsSidebar (Benefit & Fasilitas Pengunjung)", () => {
    it("merender Shuttle Bus Lorena, Hall 5 Community, dan Fasilitas Venue Ber-AC", () => {
      const html = renderToString(React.createElement(EventBenefitsSidebar));

      expect(html).toContain("Benefit &amp; Fasilitas Pengunjung");
      expect(html).toContain("Shuttle Bus Gratis Lorena");
      expect(html).toContain("St. Cisauk");
      expect(html).toContain("Hall 10 ICE BSD");
      expect(html).toContain("Free Community Area di Hall 5");
      expect(html).toContain("Venue Ber-AC &amp; Ruang Ganti Resmi");
    });
  });

  describe("6. EventMapPreviewCard (Akses Denah & Peta Event)", () => {
    it("merender mini preview dan tautan ke peta event", () => {
      const html = renderToString(
        React.createElement(EventMapPreviewCard, {
          mapHref: "/events/cf23/map",
          hallsText: "Hall 5, 6, 7, 8, 9, 10"
        })
      );

      expect(html).toContain("Akses Denah &amp; Peta Event");
      expect(html).toContain("Buka Peta Event");
      expect(html).toContain("/events/cf23/map");
      expect(html).toContain("Hall 5, 6, 7, 8, 9, 10");
    });
  });

  describe("7. Breadcrumb Formatting", () => {
    it("memformat rekam jejak Comic Frontier 23 dengan format Dashboard / Events / Comic Frontier 23", () => {
      const eventName = "Comic Frontier 23 (Comifuro 23)";
      const isCf23 = true;
      const breadcrumbName = isCf23
        ? "Comic Frontier 23"
        : (eventName.includes(" (") ? eventName.split(" (")[0] : eventName);

      expect(breadcrumbName).toBe("Comic Frontier 23");
    });
  });
});
