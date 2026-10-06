import { describe, expect, it } from "vitest";
import {
  buildPathWithQuery,
  compactUrl,
  formatEnumLabel,
  getPageParam,
  getSearchParam,
  paginateItems,
  toDateTimeLocalValue,
  truncateText,
  type SearchParams
} from "@/lib/admin-ui";

describe("getSearchParam", () => {
  it("mengembalikan nilai string bila ada", () => {
    const params: SearchParams = { q: "book" };
    expect(getSearchParam(params, "q")).toBe("book");
  });

  it("mengembalikan undefined bila nilai berupa array", () => {
    const params: SearchParams = { q: ["a", "b"] };
    expect(getSearchParam(params, "q")).toBeUndefined();
  });

  it("mengembalikan undefined bila key tidak ada", () => {
    const params: SearchParams = {};
    expect(getSearchParam(params, "missing")).toBeUndefined();
  });
});

describe("getPageParam", () => {
  it("mengembalikan 1 bila tidak ada param page", () => {
    expect(getPageParam({})).toBe(1);
  });

  it("mem-parsing param page yang valid", () => {
    expect(getPageParam({ page: "3" })).toBe(3);
  });

  it("mengembalikan 1 untuk nilai page yang tidak valid (NaN)", () => {
    expect(getPageParam({ page: "abc" })).toBe(1);
  });

  it("mengembalikan 1 untuk nilai page negatif atau nol", () => {
    expect(getPageParam({ page: "0" })).toBe(1);
    expect(getPageParam({ page: "-5" })).toBe(1);
  });
});

describe("buildPathWithQuery", () => {
  it("mengembalikan path tanpa query bila semua value kosong/undefined", () => {
    expect(buildPathWithQuery("/products", { q: undefined, status: "" })).toBe("/products");
  });

  it("menambahkan query string untuk value yang truthy", () => {
    const result = buildPathWithQuery("/products", { q: "book", status: "TARGET" });
    expect(result).toBe("/products?q=book&status=TARGET");
  });

  it("mengabaikan key dengan value falsy", () => {
    const result = buildPathWithQuery("/products", { q: "book", event: undefined });
    expect(result).toBe("/products?q=book");
  });
});

describe("toDateTimeLocalValue", () => {
  it("mengembalikan string kosong untuk null/undefined", () => {
    expect(toDateTimeLocalValue(null)).toBe("");
    expect(toDateTimeLocalValue(undefined)).toBe("");
  });

  it("memformat tanggal menjadi format datetime-local (YYYY-MM-DDTHH:mm)", () => {
    const result = toDateTimeLocalValue("2026-07-18T09:30:00.000Z");
    expect(result).toBe("2026-07-18T09:30");
  });
});

describe("truncateText", () => {
  it("mengembalikan '-' untuk null/undefined", () => {
    expect(truncateText(null)).toBe("-");
    expect(truncateText(undefined)).toBe("-");
  });

  it("tidak memotong teks yang lebih pendek dari maxLength", () => {
    expect(truncateText("hello", 72)).toBe("hello");
  });

  it("memotong teks yang lebih panjang dari maxLength dan menambah ellipsis", () => {
    const result = truncateText("a".repeat(100), 10);
    expect(result).toBe(`${"a".repeat(9)}...`);
    expect(result.length).toBe(12);
  });
});

describe("compactUrl", () => {
  it("mengembalikan '-' untuk null/undefined", () => {
    expect(compactUrl(null)).toBe("-");
    expect(compactUrl(undefined)).toBe("-");
  });

  it("menghapus prefix www. dan menampilkan hostname + path", () => {
    expect(compactUrl("https://www.instagram.com/somepage")).toBe("instagram.com/somepage");
  });

  it("menangani URL tanpa path (root)", () => {
    expect(compactUrl("https://twitter.com/")).toBe("twitter.com");
  });

  it("fallback ke penghapusan protokol untuk string yang bukan URL valid", () => {
    expect(compactUrl("not a valid url")).toBe("not a valid url");
  });
});

describe("formatEnumLabel", () => {
  it("mengembalikan '-' untuk null/undefined", () => {
    expect(formatEnumLabel(null)).toBe("-");
    expect(formatEnumLabel(undefined)).toBe("-");
  });

  it("mengubah SNAKE_CASE menjadi Title Case dengan spasi", () => {
    expect(formatEnumLabel("PO_OPEN")).toBe("Po Open");
  });

  it("menangani enum satu kata", () => {
    expect(formatEnumLabel("TARGET")).toBe("Target");
  });
});

describe("paginateItems", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it("membagi item sesuai pageSize pada halaman pertama", () => {
    const result = paginateItems(items, 1, 10);
    expect(result.items).toEqual(items.slice(0, 10));
    expect(result.totalItems).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(1);
  });

  it("mengembalikan item halaman terakhir yang tidak penuh", () => {
    const result = paginateItems(items, 3, 10);
    expect(result.items).toEqual(items.slice(20, 25));
    expect(result.items.length).toBe(5);
  });

  it("meng-clamp page yang melebihi totalPages ke totalPages", () => {
    const result = paginateItems(items, 99, 10);
    expect(result.page).toBe(3);
  });

  it("meng-clamp page di bawah 1 menjadi 1", () => {
    const result = paginateItems(items, -5, 10);
    expect(result.page).toBe(1);
  });

  it("menangani array kosong tanpa error (totalPages minimal 1)", () => {
    const result = paginateItems([], 1, 10);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });
});
