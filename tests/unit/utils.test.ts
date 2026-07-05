import { describe, expect, it } from "vitest";
import { slugify, toBoolean, toInt, toOptionalString } from "@/lib/utils";

describe("slugify", () => {
  it("mengubah spasi menjadi tanda hubung", () => {
    expect(slugify("Atelier Hanami")).toBe("atelier-hanami");
  });

  it("mengubah huruf besar menjadi huruf kecil", () => {
    expect(slugify("ANIME EVENT SAMPLE")).toBe("anime-event-sample");
  });

  it("menghapus karakter spesial dan menggantinya dengan tanda hubung", () => {
    expect(slugify("Mikan Press! @2026")).toBe("mikan-press-2026");
  });

  it("menghapus tanda hubung di awal dan akhir", () => {
    expect(slugify("  --Hello World--  ")).toBe("hello-world");
  });

  it("menggabungkan tanda hubung berturut-turut menjadi satu", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });

  it("mengembalikan string kosong untuk input hanya karakter spesial", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("toInt", () => {
  it("mengonversi string angka menjadi number", () => {
    expect(toInt("42")).toBe(42);
  });

  it("mengembalikan fallback default (0) untuk null", () => {
    expect(toInt(null)).toBe(0);
  });

  it("mengembalikan fallback kustom untuk string kosong", () => {
    expect(toInt("   ", 7)).toBe(7);
  });

  it("mengembalikan fallback untuk string yang bukan angka", () => {
    expect(toInt("abc", 3)).toBe(3);
  });

  it("mem-parsing angka desimal sebagai integer (truncate)", () => {
    expect(toInt("12.9")).toBe(12);
  });
});

describe("toOptionalString", () => {
  it("mengembalikan undefined untuk null", () => {
    expect(toOptionalString(null)).toBeUndefined();
  });

  it("mengembalikan undefined untuk string kosong/whitespace", () => {
    expect(toOptionalString("   ")).toBeUndefined();
  });

  it("mengembalikan string yang sudah di-trim", () => {
    expect(toOptionalString("  hello  ")).toBe("hello");
  });
});

describe("toBoolean", () => {
  it("mengembalikan true untuk 'on'", () => {
    expect(toBoolean("on")).toBe(true);
  });

  it("mengembalikan true untuk 'true'", () => {
    expect(toBoolean("true")).toBe(true);
  });

  it("mengembalikan true untuk '1'", () => {
    expect(toBoolean("1")).toBe(true);
  });

  it("mengembalikan false untuk null", () => {
    expect(toBoolean(null)).toBe(false);
  });

  it("mengembalikan false untuk string yang tidak dikenal", () => {
    expect(toBoolean("false")).toBe(false);
    expect(toBoolean("0")).toBe(false);
    expect(toBoolean("random")).toBe(false);
  });
});
