"use client";

import { useState } from "react";
import { CheckCircle2, DownloadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PreloadOfflineButton({
  productIds = [],
  mapIds = [],
  circleIds = [],
  className
}: {
  productIds?: string[];
  mapIds?: string[];
  circleIds?: string[];
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handlePreload() {
    if (typeof window === "undefined" || !("caches" in window)) {
      toast.error("Browser tidak mendukung Cache Storage offline.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Menyimpan halaman & gambar untuk offline di ICE BSD...");

    try {
      const urlsToPreload = [
        "/",
        "/products",
        "/circles",
        "/maps",
        "/expenses",
        ...productIds.slice(0, 30).map((id) => `/products/${id}`),
        ...mapIds.map((id) => `/maps/${id}`),
        ...circleIds.slice(0, 20).map((id) => `/circles/${id}`)
      ];

      // Fetch each URL through browser cache (Service Worker will intercept and cache them)
      let count = 0;
      await Promise.all(
        urlsToPreload.map(async (url) => {
          try {
            await fetch(url, { cache: "reload" });
            count += 1;
          } catch {
            // Ignore individual fetch failure in preload
          }
        })
      );

      setCompleted(true);
      toast.success(`${count} halaman & data katalog berhasil disiapkan offline untuk hari-H!`, {
        id: toastId
      });
    } catch {
      toast.error("Gagal menyiapkan cache offline. Pastikan koneksi internet aktif.", {
        id: toastId
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handlePreload}
      disabled={loading}
      variant="secondary"
      className={cn(
        "gap-2 rounded-full border border-brand-200/80 bg-white/90 text-xs font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Menyimpan cache...</span>
        </>
      ) : completed ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Cache Offline Siap</span>
        </>
      ) : (
        <>
          <DownloadCloud className="h-3.5 w-3.5 text-brand-600" />
          <span>Siapkan Offline Hari-H</span>
        </>
      )}
    </Button>
  );
}
