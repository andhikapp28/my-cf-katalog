import { describe, expect, it } from "vitest";
import { buildPathWithQuery } from "@/lib/admin-ui";

describe("Products Catalog Filter URL Builder", () => {
  it("membangun URL filter bersih dengan query q dan day", () => {
    const url = buildPathWithQuery("/products", {
      q: "Genshin",
      day: "DAY_1",
      sort: undefined
    });
    expect(url).toBe("/products?q=Genshin&day=DAY_1");
  });

  it("menambahkan filter type rush dan fandom", () => {
    const url = buildPathWithQuery("/products", {
      type: "rush",
      fandom: "Honkai Star Rail"
    });
    expect(url).toBe("/products?type=rush&fandom=Honkai+Star+Rail");
  });

  it("membersihkan query ketika filter di-reset", () => {
    const url = buildPathWithQuery("/products", {
      q: undefined,
      day: undefined,
      type: undefined,
      fandom: undefined
    });
    expect(url).toBe("/products");
  });
});

describe("Booth Code Sorting", () => {
  it("mengurutkan nomor booth secara natural (A-01, A-02, A-10, AA-01)", () => {
    const boothCodes = ["A-10", "A-01", "AA-01", "A-02", "B-05", ""];

    const sorted = [...boothCodes].sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });

    expect(sorted).toEqual(["A-01", "A-02", "A-10", "AA-01", "B-05", ""]);
  });
});
