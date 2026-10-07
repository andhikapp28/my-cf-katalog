import { describe, expect, it } from "vitest";
import {
  DEFAULT_COMMUNITY_RULES,
  DEFAULT_TRANSPORT_GUIDE,
  EVENT_DETAILS_MAP,
  getEventDetailData,
  getEventDetailDataWithFallback,
  normalizeEventSlug
} from "@/lib/event-details-data";

describe("Event Details Data Module (docs/comifuro-events-reference.md)", () => {
  describe("1. Master Event Map (CF 16 – CF 23 Coverage)", () => {
    const requiredSlugs = ["cf16", "cf17", "cf18", "cf19", "cf20", "cf21", "cf22", "cf23"];

    it("memiliki data terverifikasi untuk seluruh 8 edisi resmi (CF 16 - CF 23)", () => {
      for (const slug of requiredSlugs) {
        expect(EVENT_DETAILS_MAP[slug], `Slug ${slug} harus terdaftar di master map`).toBeDefined();
        const event = EVENT_DETAILS_MAP[slug];
        expect(event.slug).toBe(slug);
        expect(event.ticketInfo).toBeDefined();
        expect(event.attendance).toBeDefined();
        expect(event.highlights.length).toBeGreaterThanOrEqual(3);
        expect(event.transportGuide).toBeDefined();
        expect(event.communityRules).toBeDefined();
      }
    });

    it("CF 16: validasi tiket KiosTix, OTS tunai terakhir, dan highlight hololive meet & greet", () => {
      const cf16 = EVENT_DETAILS_MAP.cf16;
      expect(cf16.ticketInfo.platform).toBe("KiosTix");
      expect(cf16.ticketInfo.regularPrice).toBe(65000);
      expect(cf16.ticketInfo.bundlePrice).toBe(115000);
      expect(cf16.ticketInfo.salesModel).toContain("OTS");
      expect(cf16.attendance.estimatedAttendees).toContain("42.000");
      expect(cf16.attendance.venueHalls).toContain("Hall 8, 9, 10");

      const notesText = cf16.ticketInfo.notes.join(" ");
      expect(notesText).toContain("OTS");
      expect(notesText).toContain("08:00 - 18:15 WIB");
      expect(notesText).toContain("18:30 WIB");
      expect(notesText).toContain("Anak >= 2 tahun");

      const highlightTitles = cf16.highlights.map((h) => h.title).join(" ");
      expect(highlightTitles).toContain("hololive");
      expect(highlightTitles).toContain("Hall");
    });

    it("CF 17: validasi peluncuran perdana Shuttle Bus Lorena dan 100% Online Ticket2U", () => {
      const cf17 = EVENT_DETAILS_MAP.cf17;
      expect(cf17.ticketInfo.platform).toBe("Ticket2U");
      expect(cf17.ticketInfo.regularPrice).toBe(65000);
      expect(cf17.ticketInfo.bundlePrice).toBe(120000);
      expect(cf17.ticketInfo.salesModel).toBe("100% Online Ticketing");
      expect(cf17.attendance.estimatedAttendees).toContain("50.000");

      const highlightText = JSON.stringify(cf17.highlights);
      expect(highlightText).toContain("Shuttle Bus");
      expect(highlightText).toContain("Lorena");
      expect(highlightText).toContain("Ticket2U");
    });

    it("CF 18: validasi Bushiroad EXPO 2024, Seiyuu BanG Dream!, dan Hall 6 F&B", () => {
      const cf18 = EVENT_DETAILS_MAP.cf18;
      expect(cf18.ticketInfo.platform).toBe("Ticket2U");
      expect(cf18.ticketInfo.regularPrice).toBe(75000);
      expect(cf18.ticketInfo.bundlePrice).toBe(130000);

      const highlightText = JSON.stringify(cf18.highlights);
      expect(highlightText).toContain("Bushiroad EXPO 2024");
      expect(highlightText).toContain("Takaaki Kidani");
      expect(highlightText).toContain("Aina Aiba");
      expect(highlightText).toContain("Yuka Nishio");
      expect(highlightText).toContain("Hall 6");
    });

    it("CF 19: validasi konser Konomi Suzuki, Yuko Suzuhana, dan paralel ICC di JCC", () => {
      const cf19 = EVENT_DETAILS_MAP.cf19;
      expect(cf19.ticketInfo.platform).toBe("Ticket2U");
      expect(cf19.ticketInfo.regularPrice).toBe(75000);

      const highlightText = JSON.stringify(cf19.highlights);
      expect(highlightText).toContain("Konomi Suzuki");
      expect(highlightText).toContain("Yuko Suzuhana");
      expect(highlightText).toContain("Upiko");
      expect(highlightText).toContain("Comic Con");
    });

    it("CF 20: validasi Comic Frontier XX (2 Dekade), Bushiroad EXPO 2025, dan Jiva Animation", () => {
      const cf20 = EVENT_DETAILS_MAP.cf20;
      expect(cf20.editionNumber).toBe(20);
      expect(cf20.editionName).toContain("CF XX");

      const highlightText = JSON.stringify(cf20.highlights);
      expect(highlightText).toContain("Comic Frontier XX");
      expect(highlightText).toContain("Bushiroad EXPO 2025");
      expect(highlightText).toContain("NOMISAKI");
      expect(highlightText).toContain("Jiva Animation");
    });

    it("CF 21: validasi rekor tertinggi 70.000 pengunjung, konser hololive ID LIVE, dan Sunsunsun Roshidere", () => {
      const cf21 = EVENT_DETAILS_MAP.cf21;
      expect(cf21.attendance.estimatedAttendees).toContain("70.000");
      expect(cf21.attendance.estimatedAttendees).toContain("Rekor Tertinggi");

      const highlightText = JSON.stringify(cf21.highlights);
      expect(highlightText).toContain("70.000");
      expect(highlightText).toContain("hololive ID 5th Anniv LIVE");
      expect(highlightText).toContain("Chromatic Future");
      expect(highlightText).toContain("Sunsunsun");
      expect(highlightText).toContain("Roshidere");
      expect(highlightText).toContain("Sky: Children of the Light");
    });

    it("CF 22: validasi 55.000 - 65.000 pengunjung, KMT KAI Commuter, Bushiroad EXPO 2026, dan @ichigowarano", () => {
      const cf22 = EVENT_DETAILS_MAP.cf22;
      expect(cf22.attendance.estimatedAttendees).toContain("55.000 – 65.000");

      const highlightText = JSON.stringify(cf22.highlights);
      expect(highlightText).toContain("Bushiroad EXPO 2026");
      expect(highlightText).toContain("KAI Commuter");
      expect(highlightText).toContain("Kartu Multi Trip");
      expect(highlightText).toContain("@ichigowarano");
      expect(highlightText).toContain("Amanda Brownies");
    });

    it("CF 23: validasi Halloween Weekend, seleksi 100% kurasi komite, dan Free Community Booth Hall 5", () => {
      const cf23 = EVENT_DETAILS_MAP.cf23;
      expect(cf23.attendance.estimatedAttendees).toContain("60.000 – 70.000");
      expect(cf23.attendance.estimatedCircles).toContain("1.500+ Terkurasi");

      const highlightText = JSON.stringify(cf23.highlights);
      expect(highlightText).toContain("Halloween Weekend");
      expect(highlightText).toContain("Kurasi Komite");
      expect(highlightText).toContain("Community Booth");
      expect(highlightText).toContain("Hall 5");
    });
  });

  describe("2. Transport Guide Data Verification", () => {
    it("memiliki panduan Shuttle Bus Lorena dengan rute, jam, dan tarif gratis terverifikasi", () => {
      const shuttle = DEFAULT_TRANSPORT_GUIDE.shuttleBus;
      expect(shuttle.name).toContain("Lorena");
      expect(shuttle.route).toContain("Terminal Intermoda BSD ⇄ Drop-off Outdoor Parking Hall 10 ICE BSD");
      expect(shuttle.hours).toContain("07:00 – 21:30 WIB");
      expect(shuttle.fare).toContain("100% Gratis");
      expect(shuttle.operator).toContain("Lorena");
    });

    it("memiliki panduan KRL Stasiun Cisauk dan Skywalk Intermoda 250 meter", () => {
      const krl = DEFAULT_TRANSPORT_GUIDE.krlSkywalk;
      expect(krl.station).toContain("Stasiun Cisauk");
      expect(krl.station).toContain("Lin Rangkasbitung");
      expect(krl.skywalkInfo).toContain("Skywalk");
      expect(krl.skywalkInfo).toContain("250m");
    });

    it("memiliki panduan Tol Serbaraja Exit BSD Barat (3 menit) dan kapasitas parkir 5.000+ mobil", () => {
      const vehicle = DEFAULT_TRANSPORT_GUIDE.tollAndVehicle;
      expect(vehicle.serbaraja).toContain("Tol Serbaraja");
      expect(vehicle.serbaraja).toContain("Exit BSD Barat");
      expect(vehicle.serbaraja).toContain("3 menit");
      expect(vehicle.parkingCapacity).toContain("5.000+");
    });

    it("memiliki 3 langkah rute transit berurutan", () => {
      expect(DEFAULT_TRANSPORT_GUIDE.routeSteps).toHaveLength(3);
      expect(DEFAULT_TRANSPORT_GUIDE.routeSteps[0].title).toContain("KRL");
      expect(DEFAULT_TRANSPORT_GUIDE.routeSteps[1].title).toContain("Skywalk");
      expect(DEFAULT_TRANSPORT_GUIDE.routeSteps[2].title).toContain("Shuttle Bus");
    });
  });

  describe("3. Community Rules & Cosplay Verification", () => {
    it("memuat aturan Anti-Generative AI dengan sanksi diskualifikasi langsung tanpa refund", () => {
      const aiRule = DEFAULT_COMMUNITY_RULES.antiGenAi;
      expect(aiRule.title).toContain("Anti-Generative AI");
      expect(aiRule.sanction.toLowerCase()).toContain("diskualifikasi langsung");
      expect(aiRule.sanction.toLowerCase()).toContain("no refund");
      expect(aiRule.description).toContain("Artificial Intelligence");
    });

    it("memuat larangan bootleg dan reseller barang pabrikan", () => {
      const bootlegRule = DEFAULT_COMMUNITY_RULES.noBootleg;
      expect(bootlegRule.title).toContain("Bootleg");
      expect(bootlegRule.description).toContain("pabrik");
      expect(bootlegRule.description).toContain("karya orisinal");
    });

    it("memuat regulasi properti senjata cosplay (EVA foam & PVC diizinkan; logam & airsoft dilarang)", () => {
      const props = DEFAULT_COMMUNITY_RULES.cosplayProps;
      const allowedText = props.allowedMaterials.join(" ");
      expect(allowedText).toContain("EVA foam");
      expect(allowedText).toContain("PVC");

      const prohibitedText = props.prohibitedMaterials.join(" ");
      expect(prohibitedText).toContain("logam");
      expect(prohibitedText).toContain("airsoft gun");
      expect(props.inspectionNote).toContain("security gate");
    });

    it("memuat prinsip 'Cosplay is Not Consent' dan zonasi foto", () => {
      const etiquette = DEFAULT_COMMUNITY_RULES.cosplayEtiquette;
      expect(etiquette.consentPrinciple).toContain("Cosplay is Not Consent");
      const rulesText = etiquette.principles.join(" ");
      expect(rulesText).toContain("TNI / POLRI");
      expect(rulesText).toContain("Circle Market");
      expect(etiquette.photoZones).toContain("Pre-function");
      expect(etiquette.photoZones).toContain("Outdoor");
    });

    it("memuat ruang ganti resmi Hall 6/7 (Rp 10.000) dan larangan ganti di toilet umum", () => {
      const changing = DEFAULT_COMMUNITY_RULES.facilities.changingRoom;
      expect(changing.fee).toContain("10.000");
      expect(changing.location).toContain("Hall 6 / Hall 7");
      expect(changing.rule).toContain("toilet umum");
    });

    it("memuat penitipan barang resmi Hall 6/7 dengan tarif Rp 10.000 - Rp 20.000", () => {
      const luggage = DEFAULT_COMMUNITY_RULES.facilities.luggageStorage;
      expect(luggage.location).toContain("Hall 6 / Hall 7");
      expect(luggage.rates).toContain("10.000");
      expect(luggage.rates).toContain("20.000");
    });
  });

  describe("4. Helper Functions & Slug Normalization", () => {
    it("menormalisasi variasi slug dengan akurat", () => {
      expect(normalizeEventSlug("cf21")).toBe("cf21");
      expect(normalizeEventSlug("CF21")).toBe("cf21");
      expect(normalizeEventSlug("cf-21")).toBe("cf21");
      expect(normalizeEventSlug("comifuro-22")).toBe("cf22");
      expect(normalizeEventSlug("COMIFURO 20")).toBe("cf20");
    });

    it("getEventDetailData mengembalikan data untuk slug valid dan null untuk slug asing", () => {
      expect(getEventDetailData("cf22")?.editionNumber).toBe(22);
      expect(getEventDetailData("cf-22")?.editionNumber).toBe(22);
      expect(getEventDetailData("unknown-event-xyz")).toBeNull();
    });

    it("getEventDetailDataWithFallback memberikan metadata lengkap saat slug tidak terdaftar", () => {
      const fallback = getEventDetailDataWithFallback("cf99", "Comic Frontier 99 Spesial", "ICE BSD Hall 1-5");
      expect(fallback.slug).toBe("cf99");
      expect(fallback.editionName).toBe("Comic Frontier 99 Spesial");
      expect(fallback.ticketInfo.platform).toBe("Ticket2U");
      expect(fallback.transportGuide.shuttleBus.name).toContain("Lorena");
      expect(fallback.communityRules.antiGenAi.sanction).toContain("no refund");
    });
  });
});
