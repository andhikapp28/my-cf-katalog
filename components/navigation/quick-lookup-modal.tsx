"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  MapPin,
  Search,
  Store,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickLookupItem {
  id: string;
  name: string;
  boothCode: string | null;
  day: string;
  fandom: string | null;
  circleCutUrl: string | null;
  productsCount: number;
}

export function QuickLookupModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [eventSlug, setEventSlug] = useState("cf22");
  const [items, setItems] = useState<QuickLookupItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut (Ctrl+K or Cmd+K) and custom open event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-quick-lookup", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-quick-lookup", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Fetch results when query or eventSlug changes
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch(`/api/quick-lookup?q=${encodeURIComponent(query)}&event=${encodeURIComponent(eventSlug)}`, {
        signal: controller.signal
      })
        .then((res) => res.json())
        .then((data) => {
          if (active) {
            setItems(data.items || []);
            setSelectedIndex(0);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (active && err.name !== "AbortError") {
            setLoading(false);
          }
        });
    }, 150);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [isOpen, query, eventSlug]);

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = items[selectedIndex];
      if (current) {
        handleSelectItem(current);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: QuickLookupItem) => {
    setIsOpen(false);
    startTransition(() => {
      if (item.boothCode) {
        router.push(`/events/${eventSlug}/map?booth=${encodeURIComponent(item.boothCode)}`);
      } else {
        router.push(`/circles?event=${eventSlug}&search=${encodeURIComponent(item.name)}`);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-lookup-title"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111215]/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Search Input Strip */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3.5 sm:px-5">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            id="quick-lookup-title"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Cari nomor booth (misal: AA-01) atau nama circle..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-md p-1 text-zinc-400 hover:text-zinc-700 transition"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            <span>ESC</span>
          </div>
        </div>

        {/* Edition Switcher & Quick Filters */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-4 py-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold text-zinc-500 uppercase mr-1">Edisi:</span>
            <button
              type="button"
              onClick={() => setEventSlug("cf22")}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition",
                eventSlug === "cf22"
                  ? "bg-[#111215] text-[#D6F834] shadow-xs"
                  : "bg-white text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200"
              )}
            >
              CF 22 (Arsip 1.477 Booth)
            </button>
            <button
              type="button"
              onClick={() => setEventSlug("cf23")}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition",
                eventSlug === "cf23"
                  ? "bg-[#111215] text-[#D6F834] shadow-xs"
                  : "bg-white text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200"
              )}
            >
              CF 23 (Upcoming)
            </button>
          </div>

          <span className="hidden sm:inline font-mono text-[11px] text-zinc-500">
            {loading ? "Mencari..." : `${items.length} hasil ditemukan`}
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-zinc-100"
          role="listbox"
        >
          {items.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Store className="h-8 w-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">
                {eventSlug === "cf23"
                  ? "Data nomor meja booth CF 23 belum dirilis panitia."
                  : query
                    ? `Tidak ada circle dengan kata kunci "${query}"`
                    : "Ketik nama circle atau nomor booth untuk mencari"}
              </p>
              <p className="text-xs text-zinc-500">
                {eventSlug === "cf23"
                  ? "Coba beralih ke tab 'CF 22' untuk melihat denah dan 1.477 booth arsip."
                  : "Contoh pencarian: TC-12, AA-05, Blue Archive, Genshin"}
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const dayLabel =
                item.day === "DAY_1"
                  ? "Sabtu (Day 1)"
                  : item.day === "DAY_2"
                    ? "Minggu (Day 2)"
                    : "2 Hari Penuh";

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition cursor-pointer text-left",
                    isSelected
                      ? "bg-[#111215] text-white shadow-sm"
                      : "hover:bg-zinc-50 text-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Booth Tag */}
                    <div
                      className={cn(
                        "flex h-9 min-w-[58px] items-center justify-center rounded-lg px-2 font-mono text-xs font-black tracking-wider transition shadow-xs",
                        item.boothCode
                          ? isSelected
                            ? "bg-[#D6F834] text-[#111215]"
                            : "bg-[#111215] text-[#D6F834]"
                          : isSelected
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-zinc-100 text-zinc-500"
                      )}
                    >
                      {item.boothCode || "TBA"}
                    </div>

                    {/* Circle Info */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs truncate">
                        <span className={cn("font-medium", isSelected ? "text-zinc-300" : "text-zinc-500")}>
                          {item.fandom || "Multi-Fandom / Original"}
                        </span>
                        <span className={isSelected ? "text-zinc-600" : "text-zinc-300"}>·</span>
                        <span className={cn("font-mono text-[11px]", isSelected ? "text-zinc-400" : "text-zinc-500")}>
                          {dayLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions preview */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.boothCode && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-bold transition",
                          isSelected
                            ? "bg-white/10 text-white"
                            : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
                        )}
                      >
                        <MapPin className="h-3 w-3 text-[#F84632]" />
                        <span className="hidden sm:inline">Peta</span>
                      </span>
                    )}
                    <span
                      className={cn(
                        "p-1 rounded-md transition",
                        isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
                      )}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & shortcut cues */}
        <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-zinc-300 bg-white px-1 font-bold">↑</kbd>
              <kbd className="rounded border border-zinc-300 bg-white px-1 font-bold">↓</kbd>
              <span>Navigasi</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-zinc-300 bg-white px-1 font-bold">↵</kbd>
              <span>Pilih / Buka</span>
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-400">
            Tekan <kbd className="font-bold text-zinc-600">Esc</kbd> untuk menutup
          </span>
        </div>
      </div>
    </div>
  );
}
