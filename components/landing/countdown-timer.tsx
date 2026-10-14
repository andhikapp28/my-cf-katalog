"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isComplete: boolean;
}

/**
 * Tanggal target resmi Comic Frontier 23:
 * 31 Oktober 2026, 09:00:00 WIB (UTC+07:00)
 */
export const CF23_DEFAULT_TARGET = "2026-10-31T09:00:00+07:00";

/**
 * Hitung selisih waktu dari target terhadap waktu sekarang.
 * Fungsi murni yang aman diuji secara deterministik di SSR dan unit test.
 */
export function calculateTimeRemaining(
  targetTimeMs: number,
  currentTimeMs: number = Date.now()
): TimeRemaining {
  const totalMs = targetTimeMs - currentTimeMs;

  if (totalMs <= 0 || Number.isNaN(totalMs)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isComplete: true
    };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs,
    isComplete: false
  };
}

export interface CountdownTimerProps {
  targetDate?: string;
  className?: string;
  eventTitle?: string;
  eventVenue?: string;
  initialNow?: number;
}

const DEFAULT_FALLBACK_TIME: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalMs: 1000,
  isComplete: false
};

export function CountdownTimer({
  targetDate = CF23_DEFAULT_TARGET,
  className,
  eventTitle = "MENUJU COMIC FRONTIER 23",
  eventVenue = "Hall 5 - 10 ICE BSD City",
  initialNow
}: CountdownTimerProps) {
  const [isMounted, setIsMounted] = useState<boolean>(initialNow !== undefined);

  const parsedTarget = new Date(targetDate).getTime();
  const targetTimestamp = Number.isNaN(parsedTarget) ? 0 : parsedTarget;

  const [time, setTime] = useState<TimeRemaining>(() => {
    if (initialNow !== undefined) {
      return calculateTimeRemaining(targetTimestamp, initialNow);
    }
    return DEFAULT_FALLBACK_TIME;
  });

  useEffect(() => {
    setIsMounted(true);

    const update = () => {
      setTime(calculateTimeRemaining(targetTimestamp, Date.now()));
    };

    update();
    const intervalId = setInterval(update, 1000);

    return () => clearInterval(intervalId);
  }, [targetTimestamp]);

  const displayReady = isMounted || initialNow !== undefined;
  const daysStr = displayReady ? String(time.days).padStart(2, "0") : "--";
  const hoursStr = displayReady ? String(time.hours).padStart(2, "0") : "--";
  const minutesStr = displayReady ? String(time.minutes).padStart(2, "0") : "--";
  const secondsStr = displayReady ? String(time.seconds).padStart(2, "0") : "--";

  const ariaTimeText = displayReady
    ? `${time.days} hari, ${time.hours} jam, ${time.minutes} menit, ${time.seconds} detik`
    : "Menghitung sisa waktu";

  return (
    <section
      role="timer"
      aria-label={`Hitung mundur ${eventTitle}: ${ariaTimeText}`}
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-3xl border border-black/20 bg-[#111215] p-6 text-white shadow-xl sm:p-8",
        className
      )}
    >
      {/* Header bar: status dot + judul event */}
      <div className="flex flex-col gap-3 border-b border-zinc-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex h-2.5 w-2.5 rounded-full",
              time.isComplete ? "bg-amber-400" : "bg-emerald-500 animate-pulse"
            )}
            aria-hidden="true"
          />
          <span className="font-mono text-xs font-bold tracking-widest text-[#D6F834] uppercase">
            {time.isComplete ? "EVENT SEDANG BERLANGSUNG" : "HITUNG MUNDUR HARI-H"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
          <span>31 OKT 2026 · 09:00 WIB · {eventVenue}</span>
        </div>
      </div>

      {/* Tampilan utama countdown angka monospace */}
      <div className="py-6 sm:py-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-6 text-center">
          {/* HARI */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/80 px-2 py-4 sm:px-4 sm:py-6 border border-zinc-800/80">
            <span className="font-mono text-3xl font-black tracking-tight text-white tabular-nums sm:text-5xl lg:text-6xl">
              {daysStr}
            </span>
            <span className="mt-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase sm:text-xs">
              HARI
            </span>
          </div>

          {/* JAM */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/80 px-2 py-4 sm:px-4 sm:py-6 border border-zinc-800/80">
            <span className="font-mono text-3xl font-black tracking-tight text-white tabular-nums sm:text-5xl lg:text-6xl">
              {hoursStr}
            </span>
            <span className="mt-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase sm:text-xs">
              JAM
            </span>
          </div>

          {/* MENIT */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/80 px-2 py-4 sm:px-4 sm:py-6 border border-zinc-800/80">
            <span className="font-mono text-3xl font-black tracking-tight text-white tabular-nums sm:text-5xl lg:text-6xl">
              {minutesStr}
            </span>
            <span className="mt-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase sm:text-xs">
              MENIT
            </span>
          </div>

          {/* DETIK */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/80 px-2 py-4 sm:px-4 sm:py-6 border border-zinc-800/80">
            <span className="font-mono text-3xl font-black tracking-tight text-[#D6F834] tabular-nums sm:text-5xl lg:text-6xl">
              {secondsStr}
            </span>
            <span className="mt-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase sm:text-xs">
              DETIK
            </span>
          </div>
        </div>
      </div>

      {/* Catatan operasional event */}
      <div className="border-t border-zinc-800/80 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono text-zinc-400">
        <p>
          Gerbang Hall 5 - 10 dibuka pukul 09:00 WIB. Pastikan e-ticket dan wristband siap sebelum antre.
        </p>
        <span className="text-zinc-400 shrink-0">
          ICE BSD City, Tangerang
        </span>
      </div>
    </section>
  );
}
