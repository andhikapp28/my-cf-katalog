import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  FadeInView,
  HeroEntranceMotion,
  HeroEntranceItem,
  MetricCardMotion,
  BannerCardMotion,
  BannerImageMotion,
  BannerBadgeMotion,
  TANALOKA_PALETTE,
  TANALOKA_COLORS,
  getFadeInOffsets,
  getHeroContainerVariants,
  getHeroItemVariants,
  getMetricCardHoverVariants,
  getBannerImageVariants,
  getBannerBadgeVariants,
  getBannerCardHoverVariants,
  getBannerCardVariants,
} from "@/components/landing/landing-motion";

describe("Landing Motion Module - Ekspor Komponen & Subkomponen", () => {
  it("mengekspor semua komponen animasi landing page dengan benar", () => {
    expect(FadeInView).toBeDefined();
    expect(HeroEntranceMotion).toBeDefined();
    expect(HeroEntranceItem).toBeDefined();
    expect(MetricCardMotion).toBeDefined();
    expect(BannerCardMotion).toBeDefined();
    expect(BannerImageMotion).toBeDefined();
    expect(BannerBadgeMotion).toBeDefined();
  });

  it("menyediakan subkomponen terpasang pada parent motion", () => {
    expect(HeroEntranceMotion.Item).toBe(HeroEntranceItem);
    expect(BannerCardMotion.Image).toBe(BannerImageMotion);
    expect(BannerCardMotion.Badge).toBe(BannerBadgeMotion);
  });

  it("komponen bertipe React function component", () => {
    expect(typeof FadeInView).toBe("function");
    expect(typeof HeroEntranceMotion).toBe("function");
    expect(typeof HeroEntranceItem).toBe("function");
    expect(typeof MetricCardMotion).toBe("function");
    expect(typeof BannerCardMotion).toBe("function");
    expect(typeof BannerImageMotion).toBe("function");
    expect(typeof BannerBadgeMotion).toBe("function");
  });
});

describe("Palet Warna Resmi TANALOKA", () => {
  it("mendefinisikan palet warna TANALOKA dengan akurat", () => {
    expect(TANALOKA_PALETTE.cardDark).toBe("#1B1D24");
    expect(TANALOKA_PALETTE.coralRed).toBe("#FF4838");
    expect(TANALOKA_PALETTE.coralRedHover).toBe("#F84632");
    expect(TANALOKA_PALETTE.glowColor).toContain("255, 72, 56");
    expect(TANALOKA_PALETTE.borderColor).toContain("255, 72, 56");
  });

  it("menyediakan alias TANALOKA_COLORS yang identik", () => {
    expect(TANALOKA_COLORS).toBe(TANALOKA_PALETTE);
  });
});

describe("Hero Entrance Motion & Natural Spring Transition", () => {
  it("getHeroContainerVariants menghasilkan konfigurasi stagger untuk motion normal", () => {
    const variants = getHeroContainerVariants(false, 0.1, 0.15);
    expect(variants.hidden).toEqual({ opacity: 0 });
    expect(variants.visible).toMatchObject({
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.15,
      },
    });
  });

  it("getHeroContainerVariants menonaktifkan delay saat prefers-reduced-motion aktif", () => {
    const variants = getHeroContainerVariants(true, 0.1, 0.15);
    expect(variants.hidden).toEqual({ opacity: 1 });
    expect(variants.visible).toMatchObject({
      opacity: 1,
      transition: { duration: 0 },
    });
  });

  it("getHeroItemVariants menggunakan transisi spring natural saat motion normal", () => {
    const variants = getHeroItemVariants(false, 28);
    expect(variants.hidden).toEqual({ opacity: 0, y: 28 });
    expect(variants.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.8,
      },
    });
  });

  it("getHeroItemVariants meniadakan animasi translasi saat prefers-reduced-motion aktif", () => {
    const variants = getHeroItemVariants(true, 28);
    expect(variants.hidden).toEqual({ opacity: 1, y: 0 });
    expect(variants.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { duration: 0 },
    });
  });
});

describe("Metric Card Motion & Coral Red Hover Effects", () => {
  it("getMetricCardHoverVariants menghasilkan efek hover spring dan glow TANALOKA", () => {
    const hover = getMetricCardHoverVariants();
    expect(hover.scale).toBe(1.02);
    expect(hover.y).toBe(-3);
    expect(hover.borderColor).toBe(TANALOKA_PALETTE.borderColor);
    expect(hover.boxShadow).toContain(TANALOKA_PALETTE.glowColor);
    expect(hover.transition).toMatchObject({
      type: "spring",
      stiffness: 400,
      damping: 25,
    });
  });

  it("mengizinkan custom glowColor dan borderColor", () => {
    const customHover = getMetricCardHoverVariants(
      "rgba(248, 70, 50, 0.3)",
      "#F84632"
    );
    expect(customHover.borderColor).toBe("#F84632");
    expect(customHover.boxShadow).toContain("rgba(248, 70, 50, 0.3)");
  });
});

describe("Banner 16:9 Landscape Card, Image Zoom & Badge Lift", () => {
  it("getBannerImageVariants melakukan zoom halus (scale: 1.05) dengan ease-out pada hover normal", () => {
    const variants = getBannerImageVariants(false);
    expect(variants.initial).toEqual({ scale: 1 });
    expect(variants.hover).toMatchObject({
      scale: 1.05,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    });
  });

  it("getBannerImageVariants menonaktifkan zoom (scale: 1) saat prefers-reduced-motion aktif", () => {
    const variants = getBannerImageVariants(true);
    expect(variants.initial).toEqual({ scale: 1 });
    expect(variants.hover).toEqual({ scale: 1 });
  });

  it("getBannerBadgeVariants mengangkat badge (y: -3, scale: 1.02) dan menambahkan shadow saat hover normal", () => {
    const variants = getBannerBadgeVariants(false);
    expect(variants.initial).toEqual({ y: 0, scale: 1 });
    expect(variants.hover).toMatchObject({
      y: -3,
      scale: 1.02,
      boxShadow: expect.stringContaining("rgba(0, 0, 0,"),
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 22,
      },
    });
  });

  it("getBannerBadgeVariants menonaktifkan elevasi badge saat prefers-reduced-motion aktif", () => {
    const variants = getBannerBadgeVariants(true);
    expect(variants.initial).toEqual({ y: 0, scale: 1 });
    expect(variants.hover).toEqual({ y: 0, scale: 1 });
  });

  it("getBannerCardHoverVariants menghasilkan efek border glow subtle dengan transisi spring", () => {
    const hover = getBannerCardHoverVariants();
    expect(hover.borderColor).toBe(TANALOKA_PALETTE.borderColor);
    expect(hover.boxShadow).toContain(TANALOKA_PALETTE.glowColor);
    expect(hover.transition).toMatchObject({
      type: "spring",
      stiffness: 400,
      damping: 25,
    });
  });

  it("getBannerCardVariants merespons hover dan mengabaikan saat prefers-reduced-motion aktif", () => {
    const normalVariants = getBannerCardVariants(false);
    expect(normalVariants.initial).toEqual({
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    });
    expect(normalVariants.hover).toMatchObject({
      borderColor: TANALOKA_PALETTE.borderColor,
      boxShadow: expect.stringContaining(TANALOKA_PALETTE.glowColor),
    });

    const reducedVariants = getBannerCardVariants(true);
    expect(reducedVariants.hover).toEqual({
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
    });
  });
});

describe("FadeInView Offset Calculation", () => {
  it("menghitung jarak dan arah perpindahan dengan benar", () => {
    expect(getFadeInOffsets("up", 30)).toEqual({ x: 0, y: 30 });
    expect(getFadeInOffsets("down", 30)).toEqual({ x: 0, y: -30 });
    expect(getFadeInOffsets("left", 30)).toEqual({ x: 30, y: 0 });
    expect(getFadeInOffsets("right", 30)).toEqual({ x: -30, y: 0 });
    expect(getFadeInOffsets("none", 30)).toEqual({ x: 0, y: 0 });
  });
});

describe("Integrasi Server Rendering & Styling TANALOKA", () => {
  it("merender MetricCardMotion dengan kelas latar gelap TANALOKA #1B1D24", () => {
    const html = renderToString(
      React.createElement(
        MetricCardMotion,
        { className: "custom-test-card" },
        React.createElement("span", null, "Konten Metrik")
      )
    );

    expect(html).toContain("bg-[#1B1D24]");
    expect(html).toContain("custom-test-card");
    expect(html).toContain("Konten Metrik");
  });

  it("merender BannerCardMotion dengan kelas aspect-[16/9] dan latar gelap #1B1D24", () => {
    const html = renderToString(
      React.createElement(
        BannerCardMotion,
        {
          imageSrc: "https://example.com/banner.jpg",
          imageAlt: "Banner CF",
          badge: React.createElement("span", null, "CF 23"),
        },
        React.createElement("p", null, "Judul Event")
      )
    );

    expect(html).toContain("aspect-[16/9]");
    expect(html).toContain("bg-[#1B1D24]");
    expect(html).toContain("CF 23");
    expect(html).toContain("Judul Event");
  });

  it("merender HeroEntranceMotion dan HeroEntranceItem tanpa error SSR", () => {
    const html = renderToString(
      React.createElement(
        HeroEntranceMotion,
        { className: "hero-parent" },
        React.createElement(
          HeroEntranceItem,
          { className: "hero-child" },
          React.createElement("h1", null, "Judul Hero")
        )
      )
    );

    expect(html).toContain("hero-parent");
    expect(html).toContain("hero-child");
    expect(html).toContain("Judul Hero");
  });

  it("merender FadeInView dengan fallback rendering tanpa error SSR", () => {
    const html = renderToString(
      React.createElement(
        FadeInView,
        { className: "fade-container" },
        React.createElement("p", null, "Konten Animasi Masuk")
      )
    );

    expect(html).toContain("fade-container");
    expect(html).toContain("Konten Animasi Masuk");
  });
});
