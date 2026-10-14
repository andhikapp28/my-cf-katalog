import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CountdownTimer,
  CF23_DEFAULT_TARGET,
  calculateTimeRemaining
} from "@/components/landing/countdown-timer";

describe("Countdown Timer Module - Target & Pure Logic", () => {
  it("menggunakan tanggal target resmi Comifuro 23 (31 Oktober 2026, 09:00 WIB)", () => {
    expect(CF23_DEFAULT_TARGET).toBe("2026-10-31T09:00:00+07:00");
    const parsed = new Date(CF23_DEFAULT_TARGET);
    expect(parsed.toISOString()).toBe("2026-10-31T02:00:00.000Z");
  });

  it("menghitung selisih waktu secara akurat untuk sisa hari, jam, menit, detik", () => {
    const targetMs = new Date("2026-10-31T09:00:00+07:00").getTime();
    // 5 hari, 14 jam, 30 menit, 45 detik sebelumnya
    const offsetMs =
      5 * 24 * 60 * 60 * 1000 +
      14 * 60 * 60 * 1000 +
      30 * 60 * 1000 +
      45 * 1000;
    const currentMs = targetMs - offsetMs;

    const remaining = calculateTimeRemaining(targetMs, currentMs);
    expect(remaining.days).toBe(5);
    expect(remaining.hours).toBe(14);
    expect(remaining.minutes).toBe(30);
    expect(remaining.seconds).toBe(45);
    expect(remaining.isComplete).toBe(false);
  });

  it("menangani kondisi saat waktu target sudah lewat atau bernilai 0", () => {
    const targetMs = 1793412000000;
    const currentMs = targetMs + 5000; // sudah lewat 5 detik

    const remaining = calculateTimeRemaining(targetMs, currentMs);
    expect(remaining.days).toBe(0);
    expect(remaining.hours).toBe(0);
    expect(remaining.minutes).toBe(0);
    expect(remaining.seconds).toBe(0);
    expect(remaining.totalMs).toBe(0);
    expect(remaining.isComplete).toBe(true);
  });

  it("menangani input timestamp tidak valid (NaN) dengan aman", () => {
    const remaining = calculateTimeRemaining(Number.NaN, Date.now());
    expect(remaining.days).toBe(0);
    expect(remaining.hours).toBe(0);
    expect(remaining.minutes).toBe(0);
    expect(remaining.seconds).toBe(0);
    expect(remaining.isComplete).toBe(true);
  });
});

describe("Countdown Timer Component - SSR & Aksesibilitas", () => {
  it("dapat di-render ke string pada lingkungan SSR tanpa error", () => {
    const html = renderToString(React.createElement(CountdownTimer));
    expect(html).toContain("role=\"timer\"");
    expect(html).toContain("HARI");
    expect(html).toContain("JAM");
    expect(html).toContain("MENIT");
    expect(html).toContain("DETIK");
    expect(html).toContain("Hall 5 - 10 ICE BSD City");
  });

  it("merender angka deterministik saat initialNow diberikan", () => {
    const targetMs = new Date("2026-10-31T09:00:00+07:00").getTime();
    const fixedNow = targetMs - (12 * 86400000 + 4 * 3600000 + 20 * 60000 + 10000);

    const html = renderToString(
      React.createElement(CountdownTimer, { initialNow: fixedNow })
    );

    expect(html).toContain(">12<");
    expect(html).toContain(">04<");
    expect(html).toContain(">20<");
    expect(html).toContain(">10<");
    expect(html).toContain("HITUNG MUNDUR HARI-H");
  });

  it("tidak mengandung karakter em-dash (—) sesuai aturan antislop R-02", () => {
    const html = renderToString(React.createElement(CountdownTimer));
    expect(html).not.toContain("—");
  });
});
