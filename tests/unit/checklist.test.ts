import { describe, expect, it } from "vitest";
import {
  filterChecklistItemsByStatus,
  isChecklistStatus,
  isDoneProductStatus,
  sortChecklistItems
} from "@/lib/checklist";

describe("isChecklistStatus", () => {
  it("menerima status yang masih relevan untuk checklist", () => {
    expect(isChecklistStatus("TARGET")).toBe(true);
    expect(isChecklistStatus("PO_OPEN")).toBe(true);
    expect(isChecklistStatus("PO_DONE")).toBe(true);
  });

  it("menolak status yang sudah selesai", () => {
    expect(isChecklistStatus("PURCHASED")).toBe(false);
    expect(isChecklistStatus("CANCELLED")).toBe(false);
    expect(isChecklistStatus("SOLD_OUT")).toBe(false);
  });
});

describe("isDoneProductStatus", () => {
  it("menganggap PURCHASED/CANCELLED/SOLD_OUT sebagai selesai", () => {
    expect(isDoneProductStatus("PURCHASED")).toBe(true);
    expect(isDoneProductStatus("CANCELLED")).toBe(true);
    expect(isDoneProductStatus("SOLD_OUT")).toBe(true);
  });

  it("menganggap TARGET/PO_OPEN/PO_DONE sebagai belum selesai", () => {
    expect(isDoneProductStatus("TARGET")).toBe(false);
    expect(isDoneProductStatus("PO_OPEN")).toBe(false);
    expect(isDoneProductStatus("PO_DONE")).toBe(false);
  });
});

describe("sortChecklistItems", () => {
  it("mengurutkan priority HIGH lebih dulu dari MEDIUM dan LOW", () => {
    const items = [
      { priority: "LOW" as const, circleName: "Circle A", name: "Item Low" },
      { priority: "HIGH" as const, circleName: "Circle A", name: "Item High" },
      { priority: "MEDIUM" as const, circleName: "Circle A", name: "Item Medium" }
    ];

    const sorted = sortChecklistItems(items);
    expect(sorted.map((item) => item.priority)).toEqual(["HIGH", "MEDIUM", "LOW"]);
  });

  it("mengelompokkan per circle (alfabetis) saat priority sama", () => {
    const items = [
      { priority: "HIGH" as const, circleName: "Zeta Circle", name: "Item Z" },
      { priority: "HIGH" as const, circleName: "Alpha Circle", name: "Item A" }
    ];

    const sorted = sortChecklistItems(items);
    expect(sorted.map((item) => item.circleName)).toEqual(["Alpha Circle", "Zeta Circle"]);
  });

  it("tidak memodifikasi array asli (pure function)", () => {
    const items = [
      { priority: "LOW" as const, circleName: "B", name: "Item 1" },
      { priority: "HIGH" as const, circleName: "A", name: "Item 2" }
    ];
    const original = [...items];

    sortChecklistItems(items);
    expect(items).toEqual(original);
  });
});

describe("filterChecklistItemsByStatus", () => {
  const items = [
    { status: "TARGET", name: "a" },
    { status: "PO_OPEN", name: "b" },
    { status: "PO_DONE", name: "c" }
  ];

  it("mengembalikan semua item saat filter ALL", () => {
    expect(filterChecklistItemsByStatus(items, "ALL")).toHaveLength(3);
  });

  it("memfilter berdasar status spesifik", () => {
    const result = filterChecklistItemsByStatus(items, "PO_OPEN");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("b");
  });
});
