"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BOOKMARKS_STORAGE_KEY = "comipocket_bookmarked_events";

interface EventActionsProps {
  eventId: string;
  eventSlug: string;
  eventName: string;
  className?: string;
}

export function EventActions({
  eventId,
  eventSlug,
  eventName,
  className
}: EventActionsProps) {
  const [mounted, setMounted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setIsBookmarked(ids.includes(eventSlug) || ids.includes(eventId));
      }
    } catch {
      // Abaikan error parsing storage
    }
  }, [eventId, eventSlug]);

  const handleToggleBookmark = () => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      let ids: string[] = stored ? JSON.parse(stored) : [];
      const exists = ids.includes(eventSlug) || ids.includes(eventId);

      if (exists) {
        ids = ids.filter((id) => id !== eventSlug && id !== eventId);
        setIsBookmarked(false);
        toast.success("Event dihapus dari daftar simpanan");
      } else {
        ids.push(eventSlug);
        setIsBookmarked(true);
        toast.success("Event berhasil disimpan ke daftar favorit!");
      }
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      toast.error("Gagal memperbarui daftar simpanan");
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: `Cek detail dan panduan event ${eventName} di ComiPocket!`,
          url
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Tautan event disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <button
        type="button"
        onClick={handleToggleBookmark}
        aria-label={
          mounted && isBookmarked
            ? `Hapus ${eventName} dari daftar simpanan`
            : `Simpan event ${eventName}`
        }
        className={cn(
          "inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1",
          mounted && isBookmarked
            ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
            : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 shadow-xs"
        )}
      >
        <Bookmark
          className={cn(
            "h-4 w-4 transition-colors",
            mounted && isBookmarked ? "fill-white text-white" : "text-zinc-600"
          )}
        />
        <span>{mounted && isBookmarked ? "Tersimpan" : "Simpan Event"}</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label={`Bagikan informasi event ${eventName}`}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-zinc-800 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Share2 className="h-4 w-4 text-zinc-600" />
        )}
        <span>{copied ? "Tersalin!" : "Bagikan"}</span>
      </button>
    </div>
  );
}
