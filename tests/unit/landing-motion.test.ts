import { describe, expect, it } from "vitest";
import {
  FadeInView,
  HeroEntranceMotion,
  HeroEntranceItem,
  MetricCardMotion,
  BannerCardMotion,
  BannerImageMotion,
  BannerBadgeMotion,
} from "@/components/landing/landing-motion";

describe("Landing Motion Module", () => {
  it("mengekspor komponen animasi landing page dengan benar", () => {
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
