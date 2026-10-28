"use client";

import { useState } from "react";
import {
  Search,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Printer,
  Layers,
  Heart,
  Calendar
} from "lucide-react";

export interface MapSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  activeDay: "SAT" | "SUN" | "ALL";
  onSelectDay: (day: "SAT" | "SUN" | "ALL") => void;
  searchTags: string[];
  onAddSearchTag: (tag: string) => void;
  onRemoveSearchTag: (tag: string) => void;
  onClearSearchTags: () => void;
  matchMode: "ANY" | "ALL";
  onToggleMatchMode: () => void;
  productFilters: string[];
  onToggleProductFilter: (filter: string) => void;
  onClearAllFilters: () => void;
  wishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
  wishlistCount: number;
  onOpenExportModal: () => void;
}

const PRODUCT_CATEGORIES = [
  { id: "Comics", label: "Comics" },
  { id: "Artbooks", label: "Artbooks" },
  { id: "Novels", label: "Novels" },
  { id: "Games", label: "Games" },
  { id: "Music", label: "Music" },
  { id: "Goods", label: "Goods" },
  { id: "Photobooks", label: "Photobooks" },
  { id: "Cosplay PB", label: "Cosplay PB" },
  { id: "Handmade", label: "Handmade" },
  { id: "Magazines", label: "Magazines" },
  { id: "Commissions", label: "Commissions" }
];

export function MapSidebar({
  isOpen,
  onToggle,
  isMobileOpen,
  onMobileClose,
  activeDay,
  onSelectDay,
  searchTags,
  onAddSearchTag,
  onRemoveSearchTag,
  onClearSearchTags,
  matchMode,
  onToggleMatchMode,
  productFilters,
  onToggleProductFilter,
  onClearAllFilters,
  wishlistOnly,
  onToggleWishlistOnly,
  wishlistCount,
  onOpenExportModal
}: MapSidebarProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleAddTag = () => {
    const trimmed = searchInput.trim();
    if (trimmed && !searchTags.includes(trimmed)) {
      onAddSearchTag(trimmed);
      setSearchInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-y-auto bg-[#181A20] text-zinc-100 p-4 space-y-4 text-xs font-sans">
      {/* Mobile Close Button */}
      <div className="flex md:hidden items-center justify-between pb-2 border-b border-zinc-800">
        <span className="font-bold text-sm tracking-wide text-zinc-100">
          Filter &amp; Pencarian Denah
        </span>
        <button
          type="button"
          onClick={onMobileClose}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          aria-label="Tutup filter"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 1. Wishlist Only Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#1F222A] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-100 text-[13px]">
              <Heart
                className={`h-4 w-4 ${wishlistOnly ? "fill-red-500 text-red-500" : "text-zinc-400"}`}
              />
              <span>Wishlist Only</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {wishlistCount} circle tersimpan
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={wishlistOnly}
              onChange={onToggleWishlistOnly}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5398DA]"></div>
          </label>
        </div>

        <button
          type="button"
          onClick={onOpenExportModal}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-zinc-950 px-3 py-2 font-bold text-[11px] transition-colors shadow-sm active:scale-[0.98]"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Make printable A3 image with Wishlist</span>
        </button>
      </div>

      {/* 2. Search Exhibitors Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#1F222A] p-3.5 space-y-2.5">
        <label className="block font-bold text-zinc-100 text-[13px]">
          Search Exhibitors
        </label>

        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by code, name, or fandom..."
              className="w-full rounded-lg bg-[#14161C] border border-zinc-700/80 pl-8 pr-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-[#5398DA] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!searchInput.trim()}
            className="rounded-lg bg-[#5398DA] hover:bg-[#4285C7] disabled:opacity-40 text-white px-2.5 py-1.5 font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Tag chips */}
        {searchTags.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {searchTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-[#5398DA]/20 border border-[#5398DA]/40 text-[#8ec2f5] px-2 py-0.5 text-[11px] font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSearchTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onToggleMatchMode}
                className="hover:text-zinc-200 underline"
              >
                Match: {matchMode === "ANY" ? "Any (OR)" : "All (AND)"}
              </button>
              <button
                type="button"
                onClick={onClearSearchTags}
                className="text-red-400 hover:text-red-300"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Day Filter Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#1F222A] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-zinc-100 text-[13px] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#5398DA]" />
            <span>Day Filter</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectDay("SAT")}
            className={`rounded-lg py-2 px-3 text-center font-bold text-xs transition-colors border ${
              activeDay === "SAT"
                ? "bg-[#5398DA] border-[#5398DA] text-white shadow-sm"
                : "bg-[#14161C] border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Saturday
          </button>
          <button
            type="button"
            onClick={() => onSelectDay("SUN")}
            className={`rounded-lg py-2 px-3 text-center font-bold text-xs transition-colors border ${
              activeDay === "SUN"
                ? "bg-[#5398DA] border-[#5398DA] text-white shadow-sm"
                : "bg-[#14161C] border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Sunday
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 text-center">
          Currently showing:{" "}
          <span className="font-bold text-zinc-200">
            {activeDay === "SAT"
              ? "Saturday"
              : activeDay === "SUN"
                ? "Sunday"
                : "All Days"}
          </span>
        </p>
      </div>

      {/* 4. Filter by Products Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#1F222A] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-zinc-100 text-[13px] flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#5398DA]" />
            <span>Filter by Products</span>
          </label>
          {productFilters.length > 0 && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-[11px] text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isChecked = productFilters.includes(cat.id);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-zinc-300 hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleProductFilter(cat.id)}
                  className="rounded bg-zinc-800 border-zinc-700 text-[#5398DA] focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                />
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>

        {productFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="w-full text-center py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 border-t border-zinc-800/80"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <div
        className={`hidden md:flex relative h-full transition-all duration-300 ease-in-out z-20 ${
          isOpen ? "w-80 lg:w-96" : "w-0"
        }`}
      >
        <div
          className={`h-full w-80 lg:w-96 border-r border-zinc-800 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {sidebarContent}
        </div>

        {/* Collapsible toggle tab on the desktop edge */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Tutup panel filter" : "Buka panel filter"}
          className="absolute left-full top-1/2 -translate-y-1/2 flex h-16 w-7 items-center justify-center rounded-r-lg border-y border-r border-zinc-800 bg-[#181A20] text-zinc-400 hover:text-white hover:bg-[#1F222A] shadow-md transition-colors z-30"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Drawer (Slide-over Modal) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative z-10 max-h-[85vh] w-full rounded-t-2xl border-t border-zinc-800 bg-[#181A20] shadow-2xl overflow-hidden flex flex-col">
            <div className="h-1.5 w-12 bg-zinc-700 rounded-full mx-auto my-2 shrink-0" />
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
