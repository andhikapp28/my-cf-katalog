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

      const [mapCard, cashCard, wishlistCard] = SURVIVAL_TOOLKIT_ITEMS;

      // 1. Peta Denah Interaktif Hall
      expect(mapCard.title).toBe("Peta Denah Interaktif Hall");
      expect(mapCard.linkHref).toBe("/maps");
      const mapContent = JSON.stringify(mapCard);
      expect(mapContent).toContain("A-15a");
      expect(mapContent).toContain("TC-12");
      expect(mapContent.toLowerCase()).toContain("pan");
      expect(mapContent.toLowerCase()).toContain("zoom");
      expect(mapContent.toLowerCase()).toContain("offline");

      // 2. Kalkulator Tunai ATM
      expect(cashCard.title).toBe("Kalkulator Tunai ATM");
      expect(cashCard.tag).toContain("ANTI-BLACKOUT QRIS");
      expect(cashCard.linkHref).toBe("/wishlist");
      const cashContent = JSON.stringify(cashCard);
      expect(cashContent).toContain("50.000");
      expect(cashContent).toContain("100.000");
      expect(cashContent).toContain("QRIS");

      // 3. Wishlist & Checklist 100% Offline
      expect(wishlistCard.title).toBe("Wishlist & Checklist 100% Offline");
      expect(wishlistCard.linkHref).toBe("/wishlist");
      const wishlistContent = JSON.stringify(wishlistCard);
      expect(wishlistContent).toContain("Rush Pagi");
      expect(wishlistContent).toContain("Pre-Order");
      expect(wishlistContent).toContain("Client Storage");
      expect(wishlistContent).toContain("login");
    });
  });

  describe("Section B: 3-Step Convention Hunting Flow Data", () => {
    it("memiliki tepat 3 langkah hunting berurutan dari rumah hingga di venue", () => {
      expect(HUNTING_FLOW_STEPS).toHaveLength(3);

      const [step1, step2, step3] = HUNTING_FLOW_STEPS;

      // Step 01: Riset & Susun Wishlist di Rumah
      expect(step1.step).toBe("01");
      expect(step1.title).toBe("Riset & Susun Wishlist di Rumah");
      const step1Content = JSON.stringify(step1);
      expect(step1Content).toContain("1.400+");
      expect(step1Content).toContain("Rush Pagi");
      expect(step1Content).toContain("Pre-Order");

      // Step 02: Tarik Tunai Pecahan Pas
      expect(step2.step).toBe("02");
      expect(step2.title).toBe("Tarik Tunai Pecahan Pas");
      const step2Content = JSON.stringify(step2);
      expect(step2Content).toContain("kalkulator ATM");
      expect(step2Content).toContain("50.000");
      expect(step2Content).toContain("100.000");
      expect(step2Content).toContain("gate");

      // Step 03: Navigasi Booth Tanpa Sinyal
      expect(step3.step).toBe("03");
      expect(step3.title).toBe("Navigasi Booth Tanpa Sinyal");
      const step3Content = JSON.stringify(step3);
      expect(step3Content).toContain("denah");
      expect(step3Content).toContain("checklist offline");
      expect(step3Content).toContain("HP");
    });
  });

  describe("Server-Side Rendering (SSR) Output", () => {
    it("CompanionToolkitSection merender judul dan 3 kartu fitur ke HTML", () => {
      const html = renderToString(React.createElement(CompanionToolkitSection));
      expect(html).toContain("EVENT DAY SURVIVAL &amp; COMPANION TOOLKIT");
      expect(html).toContain("Peta Denah Interaktif Hall");
      expect(html).toContain("Kalkulator Tunai ATM");
      expect(html).toContain("Wishlist &amp; Checklist 100% Offline");
      expect(html).toContain("A-15a");
      expect(html).toContain("TC-12");
      expect(html).toContain("Anti-Blackout QRIS");
      expect(html).toContain('href="/maps"');
      expect(html).toContain('href="/wishlist"');
    });

    it("ConventionHuntingFlowSection merender judul dan 3 langkah alur ke HTML", () => {
      const html = renderToString(React.createElement(ConventionHuntingFlowSection));
      expect(html).toContain("3-STEP CONVENTION HUNTING FLOW");
      expect(html).toContain("01");
      expect(html).toContain("Riset &amp; Susun Wishlist di Rumah");
      expect(html).toContain("02");
      expect(html).toContain("Tarik Tunai Pecahan Pas");
      expect(html).toContain("03");
      expect(html).toContain("Navigasi Booth Tanpa Sinyal");
    });

    it("CompanionToolkit wrapper merender kedua seksi dan mendukung toggle visibilitas", () => {
      const fullHtml = renderToString(React.createElement(CompanionToolkit));
      expect(fullHtml).toContain("EVENT DAY SURVIVAL &amp; COMPANION TOOLKIT");
      expect(fullHtml).toContain("3-STEP CONVENTION HUNTING FLOW");

      const onlyToolkit = renderToString(
        React.createElement(CompanionToolkit, { showHuntingFlow: false })
      );
      expect(onlyToolkit).toContain("EVENT DAY SURVIVAL &amp; COMPANION TOOLKIT");
      expect(onlyToolkit).not.toContain("3-STEP CONVENTION HUNTING FLOW");

      const onlyFlow = renderToString(
        React.createElement(CompanionToolkit, { showToolkit: false })
      );
      expect(onlyFlow).not.toContain("EVENT DAY SURVIVAL &amp; COMPANION TOOLKIT");
      expect(onlyFlow).toContain("3-STEP CONVENTION HUNTING FLOW");
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
