"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  Heart,
  ExternalLink,
  MapPin,
  Clock,
  Calendar,
  Layers,
  ShieldCheck
} from "lucide-react";
import type { CircleMarker, CommunityZone } from "@/lib/floor-map";

interface CircleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMarker?: CircleMarker | null;
  selectedZone?: CommunityZone | null;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, name: string) => void;
}

export function CircleDrawer({
  isOpen,
  onClose,
  selectedMarker,
  selectedZone,
  isWishlisted,
  onToggleWishlist
}: CircleDrawerProps) {
  // Handle keyboard ESC to dismiss
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || (!selectedMarker && !selectedZone)) {
    return null;
  }

  const isZone = Boolean(selectedZone && !selectedMarker);

  const title = selectedMarker ? selectedMarker.circleName : selectedZone?.name || "Detail Stan";
  const boothCode = selectedMarker ? selectedMarker.boothCode : selectedZone?.code || "-";
  const hall = selectedMarker ? selectedMarker.hall || "Hall 8" : selectedZone?.hall || "Hall 5";
  const dayText = selectedMarker ? selectedMarker.dayLabel : "Sabtu & Minggu";
  const entityId = selectedMarker ? (selectedMarker.circleId || selectedMarker.id) : selectedZone?.id || boothCode;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container: Slide-up sheet on mobile, docked panel on desktop */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${boothCode}: ${title}`}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl border-t border-zinc-200 bg-white shadow-2xl overflow-y-auto md:absolute md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[420px] md:max-w-[calc(100vw-2rem)] md:rounded-2xl md:border md:border-zinc-200/90 md:shadow-xl md:flex md:flex-col"
      >
        {/* Mobile Swipe / Drag Handle Bar */}
        <div className="pt-3 pb-1 md:hidden">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-zinc-300" />
        </div>

        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white/95 px-5 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-zinc-900 px-2.5 py-1 font-mono text-xs font-black uppercase text-white tracking-wide">
              {boothCode}
            </span>
            <span className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-xs font-bold text-zinc-700">
              {hall}
            </span>
            {selectedMarker?.rating && (
              <span
                className={`rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold ${
                  selectedMarker.rating === "M"
                    ? "bg-rose-100 text-rose-800"
                    : selectedMarker.rating === "PG"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {selectedMarker.rating}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail stan"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Title & Avatar / Cut */}
          <div className="flex items-start gap-4">
            {selectedMarker?.circleCutUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(selectedMarker.circleCutUrl)}
                  alt={`Circle cut ${title}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 font-mono text-xl font-black border border-zinc-200">
                {isZone ? <Layers className="h-7 w-7 text-zinc-800" /> : title.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-black text-zinc-900 leading-snug break-words">
                {title}
              </h2>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span>{dayText}</span>
              </div>

              {selectedZone?.category && (
                <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-700 uppercase tracking-wide">
                  {selectedZone.category}
                </span>
              )}
            </div>
          </div>

          {/* Quick Wishlist / Itinerary Action Button */}
          <div>
            <button
              type="button"
              onClick={() => onToggleWishlist(entityId, title)}
              className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold transition-all shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                isWishlisted
                  ? "bg-[#D6F834] text-zinc-950 hover:bg-[#cbf128] border border-zinc-900/10"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-transform ${
                  isWishlisted ? "fill-zinc-950 text-zinc-950 scale-110" : "text-white"
                }`}
              />
              <span>{isWishlisted ? "Tersimpan di Wishlist" : "Simpan ke Wishlist"}</span>
            </button>
          </div>

          {/* Location Hint Card */}
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 text-xs text-zinc-600">
            <MapPin className="h-4 w-4 shrink-0 text-[#5398DA]" />
            <div className="font-mono">
              <span className="font-bold text-zinc-900">{hall}</span>
              <span className="mx-1.5 text-zinc-300">·</span>
              <span>Posisi Booth {boothCode}</span>
            </div>
          </div>

          {/* Circle / Zone Details */}
          {selectedMarker && (
            <>
              {/* Fandom Tags */}
              {selectedMarker.fandom && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Fandom / Tema Karya
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMarker.fandom.split("/").map((f, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800"
                      >
                        {f.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {selectedMarker.categories && selectedMarker.categories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Kategori Barang
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMarker.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Media Links */}
              {selectedMarker.socialLinks && selectedMarker.socialLinks.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Tautan Media Sosial Kreator
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMarker.socialLinks.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:border-zinc-900 hover:text-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                      >
                        <span>{s.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Works Gallery (if any) */}
              {selectedMarker.sampleWorks && selectedMarker.sampleWorks.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Preview Katalog Karya
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMarker.sampleWorks.slice(0, 4).map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={encodeURI(img)}
                          alt={`Sample work ${idx + 1}`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Zone Details */}
          {selectedZone && (
            <div className="space-y-4">
              {selectedZone.operatingHours && (
                <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-mono text-zinc-800">
                  <Clock className="h-4 w-4 text-zinc-600" />
                  <span>Jam Operasional: {selectedZone.operatingHours}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Deskripsi &amp; Informasi Fasilitas
                </span>
                <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                  {selectedZone.description}
                </p>
              </div>

              {selectedZone.tags && selectedZone.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Fokus Area
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedZone.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedZone.rules && selectedZone.rules.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 font-mono">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>Panduan &amp; Tata Tertib</span>
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-600 pl-4 list-disc">
                    {selectedZone.rules.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
