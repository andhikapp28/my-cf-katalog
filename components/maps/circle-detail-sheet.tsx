"use client";

import React, { useEffect, useSyncExternalStore, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion
} from "motion/react";
import {
  Check,
  ChevronRight,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  MapPin,
  Share2,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import type { CircleMarker } from "@/lib/floor-map";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  isCircleInWishlist,
  subscribeWishlist,
  toggleCircleWishlist
} from "@/lib/wishlist";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CircleDetailSheetProps {
  marker: CircleMarker | null;
  onClose: () => void;
  floorMapName?: string;
  className?: string;
}

export function CircleDetailSheet({
  marker,
  onClose,
  floorMapName,
  className
}: CircleDetailSheetProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reaktif terhadap perubahan wishlist di localStorage lintas tab & komponen
  const wishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedImage !== null) {
          setSelectedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, onClose]);

  if (!marker) return null;

  const productIds = marker.products.map((p) => p.id);
  const isWishlisted = isCircleInWishlist(marker.circleId, productIds, wishlistIds);

  const handleToggleWishlist = () => {
    const nextState = toggleCircleWishlist(marker.circleId, productIds);
    if (nextState) {
      toast.success(`Circle "${marker.circleName}" disimpan ke Wishlist!`);
    } else {
      toast.info(`Circle "${marker.circleName}" dihapus dari Wishlist`);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${marker.circleName} · Booth ${marker.boothCode}`,
          text: `Cek booth ${marker.circleName} (${marker.boothCode}) di ${floorMapName || "Comifuro"}!`,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback ke copy clipboard bila share API dibatalkan/ditolak
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Tautan booth berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Kumpulkan semua gambar (circle cut + sampleworks + produk)
  const allGalleryImages = Array.from(
    new Set(
      [
        marker.circleCutUrl,
        ...marker.sampleWorks,
        ...marker.products.map((p) => p.imageUrl).filter(Boolean)
      ].filter((img): img is string => typeof img === "string" && img.length > 0)
    )
  );

  const dayStyle = getDayBadgeConfig(marker.day);

  return (
    <>
      <div className="hidden lg:block">
        <AnimatePresence>
          <motion.aside
            key={`desktop-${marker.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Detail Circle ${marker.circleName}`}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 50, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className={cn(
              "absolute right-4 top-4 z-30 w-[420px] max-h-[calc(100%-2rem)] overflow-y-auto rounded-3xl",
              "border border-white/15 bg-[#141720]/95 text-white shadow-2xl backdrop-blur-xl",
              "scrollbar-thin scrollbar-thumb-white/20",
              className
            )}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            <SheetContent
              marker={marker}
              dayStyle={dayStyle}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
              onShare={handleShare}
              copied={copied}
              allGalleryImages={allGalleryImages}
              onSelectImage={setSelectedImage}
              onClose={onClose}
              floorMapName={floorMapName}
            />
          </motion.aside>
        </AnimatePresence>
      </div>
      <div className="lg:hidden">
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        <motion.div
          key={`mobile-${marker.id}`}
          role="dialog"
          aria-modal="true"
          aria-label={`Detail Circle ${marker.circleName}`}
          initial={shouldReduceMotion ? { opacity: 1 } : { y: "100%" }}
          animate={{ y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[32px] pb-[max(1.5rem,env(safe-area-inset-bottom))]",
            "border-t border-white/15 bg-[#141720] text-white shadow-2xl backdrop-blur-2xl",
            "scrollbar-thin scrollbar-thumb-white/20",
            className
          )}
        >
          <div className="sticky top-0 z-10 flex justify-center bg-[#141720]/95 py-2.5 backdrop-blur-md">
            <div className="h-1.5 w-12 rounded-full bg-white/25" />
          </div>

          <SheetContent
            marker={marker}
            dayStyle={dayStyle}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleToggleWishlist}
            onShare={handleShare}
            copied={copied}
            allGalleryImages={allGalleryImages}
            onSelectImage={setSelectedImage}
            onClose={onClose}
            floorMapName={floorMapName}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {selectedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Preview karya ${marker.circleName}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-[#161922] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                aria-label="Tutup preview"
                className="absolute right-3 top-3 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative aspect-square max-h-[80vh] w-full min-w-[320px] sm:min-w-[480px]">
                <Image
                  src={selectedImage}
                  alt={`Karya ${marker.circleName}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
function SheetContent({
  marker,
  dayStyle,
  isWishlisted,
  onToggleWishlist,
  onShare,
  copied,
  allGalleryImages,
  onSelectImage,
  onClose,
  floorMapName
}: {
  marker: CircleMarker;
  dayStyle: ReturnType<typeof getDayBadgeConfig>;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
  copied: boolean;
  allGalleryImages: string[];
  onSelectImage: (url: string) => void;
  onClose: () => void;
  floorMapName?: string;
}) {
  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-xl px-3.5 py-1.5",
              "font-[var(--font-mono)] text-base sm:text-lg font-black tracking-wider",
              "bg-[#D6F834] text-[#111215] shadow-md border-2 border-[#c6e926]"
            )}
          >
            {marker.boothCode}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border",
              dayStyle.bg,
              dayStyle.text,
              dayStyle.border
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dayStyle.dot }} />
            {dayStyle.label}
          </span>
          {marker.rating ? (
            <span
              className={cn(
                "rounded-lg px-2 py-0.5 text-xs font-bold border",
                marker.rating === "M"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : marker.rating === "PG"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              )}
            >
              {marker.rating === "M" ? "18+ Mature" : marker.rating === "PG" ? "PG" : "GA General"}
            </span>
          ) : null}
          {marker.hasRush ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#FF4838] px-2.5 py-1 text-xs font-extrabold text-white">
              <Zap className="h-3 w-3 fill-white" />
              WAR PAGI
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail circle"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/15 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div>
        <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
          {marker.circleName}
        </h2>

        {marker.fandom ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <Sparkles className="h-3 w-3 text-[#D6F834]" />
              Fandom: <strong className="text-[#D6F834] font-semibold">{marker.fandom}</strong>
            </span>
          </div>
        ) : null}

        {floorMapName ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/50">
            <MapPin className="h-3 w-3 text-[#5398DA]" />
            Lokasi: {floorMapName} · Meja {marker.boothCode}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2.5">
        <button
          type="button"
          onClick={onToggleWishlist}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-extrabold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]",
            isWishlisted
              ? "bg-[#FF4838] text-white shadow-lg shadow-[#FF4838]/30 hover:bg-[#e03a2b]"
              : "bg-white text-[#111215] hover:bg-[#f0f0f0] border border-white/20"
          )}
        >
          <Heart
            className={cn("h-4 w-4 transition-transform", isWishlisted && "fill-white scale-110")}
          />
          {isWishlisted ? "Tersimpan di Wishlist" : "Tambah ke Wishlist"}
        </button>

        <button
          type="button"
          onClick={onShare}
          aria-label="Bagikan koordinat booth"
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
        >
          {copied ? <Check className="h-5 w-5 text-[#D6F834]" /> : <Share2 className="h-5 w-5" />}
        </button>
      </div>
      {marker.circleCutUrl ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
            Circle Cut
          </p>
          <button
            type="button"
            onClick={() => onSelectImage(marker.circleCutUrl!)}
            aria-label="Perbesar foto circle cut"
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 bg-[#1B1F2A] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
          >
            <Image
              src={marker.circleCutUrl}
              alt={`Circle Cut ${marker.circleName}`}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
              <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                Klik untuk perbesar
              </span>
            </div>
          </button>
        </div>
      ) : null}
      {marker.description ? (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
            Deskripsi & Catatan
          </p>
          <p className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs sm:text-sm leading-relaxed text-white/80 whitespace-pre-line">
            {marker.description}
          </p>
        </div>
      ) : null}

      {marker.categories.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
            Kategori Jualan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {marker.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {marker.socialLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
            Tautan Media Sosial
          </p>
          <div className="flex flex-wrap gap-2">
            {marker.socialLinks.map((soc) => (
              <a
                key={soc.url}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white/90 transition hover:border-[#5398DA] hover:bg-[#5398DA]/10 hover:text-[#5398DA] active:scale-[0.98]"
              >
                <span>{soc.label}</span>
                <ExternalLink className="h-3 w-3 text-white/50" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {allGalleryImages.length > 0 ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
              Galeri Karya & Katalog ({allGalleryImages.length})
            </p>
            <span className="text-[11px] text-white/40">Klik untuk melihat</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {allGalleryImages.slice(0, 6).map((imgUrl, idx) => (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => onSelectImage(imgUrl)}
                aria-label={`Lihat karya sampel ${idx + 1}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/15 bg-[#1B1F2A] transition-transform hover:scale-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
              >
                <Image
                  src={imgUrl}
                  alt={`Sampel ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
              </button>
            ))}
          </div>

          {allGalleryImages.length > 6 ? (
            <button
              type="button"
              onClick={() => onSelectImage(allGalleryImages[6])}
              className="w-full text-center py-2 text-xs font-semibold text-[#5398DA] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5398DA]"
            >
              Lihat {allGalleryImages.length - 6} gambar lainnya...
            </button>
          ) : null}
        </div>
      ) : null}
      {marker.products.length > 0 ? (
        <div className="space-y-2.5">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
            Target Produk Belanja ({marker.products.length})
          </p>
          <div className="space-y-2">
            {marker.products.map((prod) => (
              <Link
                key={prod.id}
                href={`/products/${prod.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs sm:text-sm text-white/90 transition hover:border-[#D6F834] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold">{prod.name}</p>
                  <p className="text-[11px] text-[#D6F834] font-medium">
                    {formatCurrency(prod.price)}
                  </p>
                </div>
                {prod.isRush ? (
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                    RUSH
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-white/40" />
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
        <Link
          href={`/circles/${marker.circleId}`}
          className="flex-1 min-h-[44px] flex items-center justify-center text-center rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-bold text-white transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
        >
          Lihat Profil Circle
        </Link>
        <Link
          href={`/products?circleId=${marker.circleId}`}
          className="flex-1 min-h-[44px] flex items-center justify-center text-center rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-bold text-white transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
        >
          Semua Produk ({marker.products.length})
        </Link>
      </div>
    </div>
  );
}

// Helper styling badge jadwal hari
function getDayBadgeConfig(day: string) {
  switch (day) {
    case "DAY_1":
      return {
        bg: "bg-[#5398DA]/20",
        text: "text-[#5398DA]",
        border: "border-[#5398DA]/40",
        dot: "#5398DA",
        label: "Day 1 (Sabtu)"
      };
    case "DAY_2":
      return {
        bg: "bg-[#D6F834]/20",
        text: "text-[#D6F834]",
        border: "border-[#D6F834]/40",
        dot: "#D6F834",
        label: "Day 2 (Minggu)"
      };
    case "ALL_DAYS":
    default:
      return {
        bg: "bg-[#FF4838]/20",
        text: "text-[#FF4838]",
        border: "border-[#FF4838]/40",
        dot: "#FF4838",
        label: "Both Days (Sabtu & Minggu)"
      };
  }
}
