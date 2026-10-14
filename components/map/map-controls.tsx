"use client";

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MapControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  className?: string;
}

export function MapControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  className = ""
}: MapControlsProps) {
  const percentage = Math.round(scale * 100);

  return (
    <div
      aria-label="Kontrol Navigasi Peta"
      className={`inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-white/95 p-1.5 shadow-lg backdrop-blur-md ${className}`}
    >
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Perbesar denah (+)"
        title="Perbesar (Zoom In)"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 active:scale-95"
      >
        <ZoomIn className="h-5 w-5" />
      </button>

      <span
        className="min-w-[48px] px-1 text-center font-mono text-xs font-bold text-zinc-700 select-none"
        aria-live="polite"
        title="Tingkat Perbesaran"
      >
        {percentage}%
      </span>

      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Perkecil denah (-)"
        title="Perkecil (Zoom Out)"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 active:scale-95"
      >
        <ZoomOut className="h-5 w-5" />
      </button>

      <div className="h-6 w-px bg-zinc-200 mx-0.5" />

      <button
        type="button"
        onClick={onReset}
        aria-label="Atur ulang tampilan denah (Reset View)"
        title="Atur Ulang Tampilan (Reset)"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 active:scale-95"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
