import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EventGuidesSection } from "@/components/events/event-guides-section";
import {
  EVENT_DETAILS_MAP,
  getEventDetailDataWithFallback
} from "@/lib/event-details-data";

describe("EventGuidesSection Component SSR Rendering", () => {
  it("merender tanpa error untuk edisi CF 21 (Rekor Pengunjung 70.000)", () => {
    const data = EVENT_DETAILS_MAP.cf21;
    const html = renderToString(React.createElement(EventGuidesSection, { data }));

    // Tab buttons
    expect(html).toContain("Semua Panduan");
    expect(html).toContain("Tiket &amp; Waktu Akses Gate");
    expect(html).toContain("Sorotan Utama &amp; Tamu");
    expect(html).toContain("Transportasi &amp; Shuttle Bus");
    expect(html).toContain("Regulasi Komunitas &amp; Cosplay");

    // Tiket section
    expect(html).toContain("Ticket2U");
    expect(html).toContain("70.000 (Rekor Tertinggi)");
    expect(html).toContain("08:00 WIB");
    expect(html).toContain("18:15 WIB");
    expect(html).toContain("18:30 WIB");

    // Highlights section
    expect(html).toContain("hololive ID 5th Anniv LIVE");
    expect(html).toContain("Sunsunsun");
    expect(html).toContain("Roshidere");
    expect(html).toContain("Sky: Children of the Light");

    // Transport section
    expect(html).toContain("Shuttle Bus Gratis Lorena");
    expect(html).toContain("Terminal Intermoda BSD ⇄ Drop-off Outdoor Parking Hall 10 ICE BSD");
    expect(html).toContain("07:00 – 21:30 WIB");
    expect(html).toContain("Skywalk Intermoda");
    expect(html).toContain("Tol Serbaraja");

    // Community rules section
    expect(html).toContain("Aturan Tegas Anti-Generative AI");
    expect(html).toContain("DISKUALIFIKASI LANGSUNG");
    expect(html).toContain("EVA foam");
    expect(html).toContain("airsoft gun");
    expect(html).toContain("Cosplay is Not Consent");
    expect(html).toContain("Rp 10.000 / orang per sesi masuk");
  });

  it("merender tanpa error untuk edisi CF 22 (KAI Commuter & Bushiroad)", () => {
    const data = EVENT_DETAILS_MAP.cf22;
    const html = renderToString(React.createElement(EventGuidesSection, { data }));

    expect(html).toContain("Bushiroad EXPO 2026 Jakarta");
    expect(html).toContain("Kartu Multi Trip (KMT) KAI Commuter");
    expect(html).toContain("@ichigowarano");
    expect(html).toContain("Amanda Brownies");
    expect(html).toContain("55.000 – 65.000");
  });

  it("merender tanpa error untuk edisi CF 16 (OTS Cash & KiosTix)", () => {
    const data = EVENT_DETAILS_MAP.cf16;
    const html = renderToString(React.createElement(EventGuidesSection, { data }));

    expect(html).toContain("KiosTix");
    expect(html).toContain("Rp 65.000");
    expect(html).toContain("Rp 115.000");
    expect(html).toContain("OTS");
  });

  it("merender dengan baik saat menggunakan data fallback slug kustom", () => {
    const data = getEventDetailDataWithFallback("cf99-custom", "Comic Frontier 99", "ICE BSD Hall 1-10");
    const html = renderToString(React.createElement(EventGuidesSection, { data }));

    expect(html).toContain("Comic Frontier 99");
    expect(html).toContain("Shuttle Bus Gratis Lorena");
    expect(html).toContain("Anti-Generative AI");
  });
});
