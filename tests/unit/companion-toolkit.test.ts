import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CompanionToolkit,
  CompanionToolkitSection,
  ConventionHuntingFlowSection,
  EventDaySurvivalToolkit,
  ThreeStepHuntingFlow,
  SURVIVAL_TOOLKIT_ITEMS,
  HUNTING_FLOW_STEPS
} from "@/components/landing/companion-toolkit";
import { SiteFooter } from "@/components/layout/site-footer";

describe("Companion Toolkit & Hunting Flow Module", () => {
  it("mengekspor komponen dan alias dengan benar", () => {
    expect(typeof CompanionToolkit).toBe("function");
    expect(typeof CompanionToolkitSection).toBe("function");
    expect(typeof ConventionHuntingFlowSection).toBe("function");
    expect(typeof EventDaySurvivalToolkit).toBe("function");
    expect(typeof ThreeStepHuntingFlow).toBe("function");
    expect(EventDaySurvivalToolkit).toBe(CompanionToolkitSection);
    expect(ThreeStepHuntingFlow).toBe(ConventionHuntingFlowSection);
  });

  describe("Section A: Event Day Survival & Companion Toolkit Data", () => {
    it("memiliki tepat 3 kartu toolkit dengan konten TANALOKA yang lengkap", () => {
      expect(SURVIVAL_TOOLKIT_ITEMS).toHaveLength(3);

      const [circleCard, bookmarkCard, offlineCard] = SURVIVAL_TOOLKIT_ITEMS;

      // 1. Pencarian Booth & Meja Circle
      expect(circleCard.title).toBe("Pencarian Booth & Meja Circle");
      expect(circleCard.linkHref).toBe("/circles");
      const circleContent = JSON.stringify(circleCard);
      expect(circleContent).toContain("A-15a");
      expect(circleContent).toContain("TC-12");
      expect(circleContent).toContain("Day 1");
      expect(circleContent).toContain("Day 2");

      // 2. Circle Tersimpan (Bookmark)
      expect(bookmarkCard.title).toBe("Circle Tersimpan (Bookmark)");
      expect(bookmarkCard.linkHref).toBe("/wishlist");
      const bookmarkContent = JSON.stringify(bookmarkCard);
      expect(bookmarkContent).toContain("Client Storage");
      expect(bookmarkContent).toContain("login");

      // 3. Akses 100% Offline PWA
      expect(offlineCard.title).toBe("Akses 100% Offline PWA");
      expect(offlineCard.linkHref).toBe("/circles");
      const offlineContent = JSON.stringify(offlineCard);
      expect(offlineContent).toContain("offline-first");
      expect(offlineContent).toContain("Service worker");
    });
  });

  describe("Section B: 3-Step Convention Hunting Flow Data", () => {
    it("memiliki tepat 3 langkah hunting berurutan dari rumah hingga di venue", () => {
      expect(HUNTING_FLOW_STEPS).toHaveLength(3);

      const [step1, step2, step3] = HUNTING_FLOW_STEPS;

      // Step 01: Riset & Tandai Circle di Rumah
      expect(step1.step).toBe("01");
      expect(step1.title).toBe("Riset & Tandai Circle di Rumah");
      const step1Content = JSON.stringify(step1);
      expect(step1Content).toContain("circle kreator");
      expect(step1Content).toContain("bookmark");

      // Step 02: Cek Jadwal & Rute Kunjungan
      expect(step2.step).toBe("02");
      expect(step2.title).toBe("Cek Jadwal & Rute Kunjungan");
      const step2Content = JSON.stringify(step2);
      expect(step2Content).toContain("Day 1");
      expect(step2Content).toContain("Day 2");

      // Step 03: Berburu Meja Stan Tanpa Sinyal
      expect(step3.step).toBe("03");
      expect(step3.title).toBe("Berburu Meja Stan Tanpa Sinyal");
      const step3Content = JSON.stringify(step3);
      expect(step3Content).toContain("A-15a");
      expect(step3Content).toContain("TC-12");
    });
  });

  describe("Server-Side Rendering (SSR) Output", () => {
    it("CompanionToolkitSection merender judul dan 3 kartu fitur ke HTML", () => {
      const html = renderToString(React.createElement(CompanionToolkitSection));
      expect(html).toContain("Event Day Survival &amp; Companion Toolkit");
      expect(html).toContain("Pencarian Booth &amp; Meja Circle");
      expect(html).toContain("Circle Tersimpan (Bookmark)");
      expect(html).toContain("Akses 100% Offline PWA");
      expect(html).toContain("A-15a");
      expect(html).toContain("TC-12");
      expect(html).toContain('href="/circles"');
      expect(html).toContain('href="/wishlist"');
    });

    it("ConventionHuntingFlowSection merender judul dan 3 langkah alur ke HTML", () => {
      const html = renderToString(React.createElement(ConventionHuntingFlowSection));
      expect(html).toContain("3 Langkah Hunting di Konvensi");
      expect(html).toContain("01");
      expect(html).toContain("Riset &amp; Tandai Circle di Rumah");
      expect(html).toContain("02");
      expect(html).toContain("Cek Jadwal &amp; Rute Kunjungan");
      expect(html).toContain("03");
      expect(html).toContain("Berburu Meja Stan Tanpa Sinyal");
    });

    it("CompanionToolkit wrapper merender kedua seksi dan mendukung toggle visibilitas", () => {
      const fullHtml = renderToString(React.createElement(CompanionToolkit));
      expect(fullHtml).toContain("Event Day Survival &amp; Companion Toolkit");
      expect(fullHtml).toContain("3 Langkah Hunting di Konvensi");

      const onlyToolkit = renderToString(
        React.createElement(CompanionToolkit, { showHuntingFlow: false })
      );
      expect(onlyToolkit).toContain("Event Day Survival &amp; Companion Toolkit");
      expect(onlyToolkit).not.toContain("3 Langkah Hunting di Konvensi");

      const onlyFlow = renderToString(
        React.createElement(CompanionToolkit, { showToolkit: false })
      );
      expect(onlyFlow).not.toContain("Event Day Survival &amp; Companion Toolkit");
      expect(onlyFlow).toContain("3 Langkah Hunting di Konvensi");
    });
  });

  describe("SiteFooter Mascot Top-Clipping Fix", () => {
    it("memastikan container mascot footer tidak overflow-hidden dan memiliki headroom padding", () => {
      const html = renderToString(React.createElement(SiteFooter));

      // Harus merender teks display COMIPOCKET dan gambar maskot
      expect(html).toContain("COMIPOCKET");
      expect(html).toContain("ComiPocket Mascot Footer");

      // Container tidak boleh memotong maskot dengan overflow-hidden
      expect(html).toContain("overflow-visible");
      // Harus memiliki headroom padding untuk tinggi maskot (h-64)
      expect(html).toMatch(/pt-(12|14|16|20)/);
    });
  });
});
