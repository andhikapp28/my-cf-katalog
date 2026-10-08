import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

describe("formatCurrency", () => {
  it("memformat angka menjadi mata uang IDR tanpa desimal", () => {
    const result = formatCurrency(185000);
    // Intl.NumberFormat id-ID bisa memakai "Rp" atau "IDR" tergantung runtime ICU,
    // dan pemisah ribuan id-ID memakai titik (mis. "185.000"), bukan desimal.
    // Karena maximumFractionDigits: 0, hasil tidak boleh diakhiri koma-desimal.
    expect(result).toContain("185");
    expect(result).toContain("000");
    expect(result).not.toMatch(/,\d{2}$/);
  });

  it("memformat nol dengan benar", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("memformat angka negatif", () => {
    const result = formatCurrency(-50000);
    expect(result).toContain("50");
    expect(result).toMatch(/-/);
  });
});

describe("formatDate", () => {
  it("mengembalikan '-' untuk null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("mengembalikan '-' untuk undefined", () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("mengembalikan '-' untuk string kosong", () => {
    expect(formatDate("")).toBe("-");
  });

  it("memformat string tanggal ISO menjadi tanggal terbaca", () => {
    const result = formatDate("2026-07-18");
    expect(result).not.toBe("-");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("memformat objek Date", () => {
    const result = formatDate(new Date("2026-07-18T00:00:00Z"));
    expect(result).not.toBe("-");
  });
});

describe("formatDateTime", () => {
  it("mengembalikan '-' untuk null/undefined", () => {
    expect(formatDateTime(null)).toBe("-");
    expect(formatDateTime(undefined)).toBe("-");
  });

  it("memformat tanggal dan waktu bersamaan", () => {
    const result = formatDateTime("2026-07-18T09:00:00+07:00");
    expect(result).not.toBe("-");
    // format waktu id-ID umumnya memuat titik dua pemisah jam:menit
    expect(result).toMatch(/\d/);
  });
});
