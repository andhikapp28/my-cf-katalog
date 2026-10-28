"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  Heart,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import type { RawCircleEntry } from "./leaflet-map-canvas";

export interface CircleExplorerProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  circles: RawCircleEntry[];
  selectedCircleId: string | null;
  wishlistIds: string[];
  onToggleWishlist: (circleId: string) => void;
  onSelectCircle: (circle: RawCircleEntry) => void;
}

export function CircleExplorer({
  isExpanded,
  onToggleExpand,
  circles,
  selectedCircleId,
  wishlistIds,
  onToggleWishlist,
  onSelectCircle
}: CircleExplorerProps) {
  const [viewMode, setViewMode] = useState<"compact" | "catalog">("compact");
  const [columns, setColumns] = useState<1 | 2 | 3>(2);
  const [sampleworksModal, setSampleworksModal] = useState<RawCircleEntry | null>(
    null
  );

  const wishlistSet = useMemo(
    () => new Set(wishlistIds.map(String)),
    [wishlistIds]
  );

  return (
    <>
      <div
        className={`w-full border-t border-zinc-800 bg-[#14161C] text-zinc-100 transition-all duration-300 ease-in-out z-20 flex flex-col ${
          isExpanded ? "h-80 sm:h-96" : "h-12"
        }`}
      >
        {/* Explorer Header / Bar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 px-4 bg-[#181A20] select-none">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-2 text-xs font-bold text-zinc-200 hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[#5398DA]" />
            ) : (
              <ChevronUp className="h-4 w-4 text-[#5398DA]" />
            )}
            <span>Circle Explorer</span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
              {circles.length} circles found
            </span>
          </button>

          {/* View controls (Only when expanded) */}
          {isExpanded && (
            <div className="flex items-center gap-2 text-xs">
              {/* Compact / Catalog Switcher */}
              <div className="flex items-center rounded-lg bg-[#111215] p-0.5 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setViewMode("compact")}
                  title="Tampilan List Ringkas"
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    viewMode === "compact"
                      ? "bg-[#5398DA] text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <LayoutList className="h-3 w-3" />
                  <span>Compact</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("catalog")}
                  title="Tampilan Kartu Katalog"
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    viewMode === "catalog"
                      ? "bg-[#5398DA] text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span>Catalog</span>
                </button>
              </div>

              {/* Column switcher for catalog mode */}
              {viewMode === "catalog" && (
                <div className="hidden sm:flex items-center rounded-lg bg-[#111215] p-0.5 border border-zinc-800 text-[11px]">
                  {[1, 2, 3].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColumns(col as 1 | 2 | 3)}
                      className={`px-2 py-1 rounded-md font-bold transition-colors ${
                        columns === col
                          ? "bg-zinc-700 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {col}C
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explorer Content */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto p-3">
            {circles.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-zinc-500 text-xs py-8">
                <p>Tidak ada circle yang cocok dengan filter aktif.</p>
              </div>
            ) : viewMode === "compact" ? (
              /* Compact View (List) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {circles.map((circle) => {
                  const circleIdStr = String(circle.id);
                  const isWishlist = wishlistSet.has(circleIdStr);
                  const isSelected = selectedCircleId === circleIdStr;

                  return (
                    <div
                      key={circle.id}
                      onClick={() => onSelectCircle(circle)}
                      className={`group relative flex items-center gap-2.5 rounded-lg border bg-[#181A20] p-2 hover:border-[#5398DA] hover:bg-[#1F222A] cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#5398DA] ring-1 ring-[#5398DA]"
                          : isWishlist
                            ? "border-amber-500/80 border-l-4 border-l-amber-400"
                            : "border-zinc-800"
                      }`}
                    >
                      {/* Thumbnail 40x40 */}
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-800 border border-zinc-700/60">
                        {circle.circle_cut ? (
                          <img
                            src={circle.circle_cut}
                            alt={circle.name || "Circle cut"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#8ec2f5]">
                            {circle.circle_code || "-"}
                          </span>
                          <span className="rounded bg-zinc-800 px-1 py-0.2 text-[9px] font-semibold text-zinc-400">
                            {circle.day?.toUpperCase().includes("SAT") && !circle.day?.toUpperCase().includes("BOTH")
                              ? "SAT"
                              : circle.day?.toUpperCase().includes("SUN") && !circle.day?.toUpperCase().includes("BOTH")
                                ? "SUN"
                                : "BOTH"}
                          </span>
                        </div>
                        <p className="truncate text-xs font-bold text-zinc-100 group-hover:text-white">
                          {circle.name || "Circle Kreator"}
                        </p>
                        <p className="truncate text-[10px] text-zinc-400">
                          {circle.fandom || "Multi-fandom"}
                        </p>
                      </div>

                      {/* Wishlist button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(circleIdStr);
                        }}
                        aria-label="Wishlist"
                        className={`p-1.5 rounded-md hover:bg-zinc-800 transition-colors shrink-0 ${
                          isWishlist
                            ? "text-amber-400"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${isWishlist ? "fill-amber-400" : ""}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Catalog View (Cards) */
              <div
                className={`grid gap-3 ${
                  columns === 1
                    ? "grid-cols-1 max-w-xl mx-auto"
                    : columns === 2
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {circles.map((circle) => {
                  const circleIdStr = String(circle.id);
                  const isWishlist = wishlistSet.has(circleIdStr);
                  const isSelected = selectedCircleId === circleIdStr;
                  const sampleCount = Array.isArray(circle.sampleworks_images)
                    ? circle.sampleworks_images.length
                    : 0;

                  return (
                    <div
                      key={circle.id}
                      onClick={() => onSelectCircle(circle)}
                      className={`group flex flex-col rounded-xl border bg-[#181A20] overflow-hidden hover:border-[#5398DA] cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#5398DA] ring-2 ring-[#5398DA]"
                          : isWishlist
                            ? "border-amber-500/80 border-t-2 border-t-amber-400"
                            : "border-zinc-800"
                      }`}
                    >
                      {/* Banner / Circle Cut Preview */}
                      <div className="relative h-36 w-full bg-zinc-900 overflow-hidden">
                        {circle.circle_cut ? (
                          <img
                            src={circle.circle_cut}
                            alt={circle.name || "Circle cut"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}

                        {/* Badges on banner */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="rounded-md bg-black/80 backdrop-blur-sm px-2 py-0.5 font-mono text-xs font-bold text-white border border-white/10">
                            {circle.circle_code || "-"}
                          </span>
                          <span className="rounded-md bg-[#5398DA]/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {circle.day?.toUpperCase().includes("SAT") && !circle.day?.toUpperCase().includes("BOTH")
                              ? "Day 1 (Sabtu)"
                              : circle.day?.toUpperCase().includes("SUN") && !circle.day?.toUpperCase().includes("BOTH")
                                ? "Day 2 (Minggu)"
                                : "Sabtu & Minggu"}
                          </span>
                        </div>

                        {/* Wishlist Button on Banner */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(circleIdStr);
                          }}
                          className={`absolute top-2 right-2 rounded-full p-2 backdrop-blur-md transition-colors ${
                            isWishlist
                              ? "bg-amber-400 text-zinc-950"
                              : "bg-black/60 text-white hover:bg-black/80"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${isWishlist ? "fill-zinc-950" : ""}`}
                          />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-sm font-extrabold text-zinc-100 group-hover:text-[#5398DA] transition-colors truncate">
                            {circle.name || "Circle Kreator"}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {circle.fandom || "Multi-fandom"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                          {sampleCount > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSampleworksModal(circle);
                              }}
                              className="text-[#8ec2f5] hover:text-white font-semibold flex items-center gap-1"
                            >
                              <span>Samples ({sampleCount})</span>
                            </button>
                          ) : (
                            <span className="text-zinc-600">No samples</span>
                          )}

                          <span className="text-zinc-400 group-hover:text-zinc-200 flex items-center gap-0.5 font-medium">
                            <span>Buka Denah</span>
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sampleworks Lightbox Modal */}
      {sampleworksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-2xl w-full rounded-2xl bg-[#181A20] border border-zinc-800 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Sample Works · {sampleworksModal.name}
                </h3>
                <span className="font-mono text-xs text-[#5398DA]">
                  Booth {sampleworksModal.circle_code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSampleworksModal(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(sampleworksModal.sampleworks_images || []).map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-zinc-900 overflow-hidden border border-zinc-800"
                >
                  <img
                    src={img}
                    alt={`Sample ${idx + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
