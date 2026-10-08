"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { ProductImage } from "@/components/products/product-image";
import { WishlistHeartButton } from "@/components/wishlist/wishlist-heart-button";
import {
  formatCircleImageUrl,
  type CompactCircleItem
} from "@/components/products/compact-circle-card";
import { parseCircleNotes } from "@/lib/floor-map";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CircleCatalogModalProps {
  circle: CompactCircleItem | null;
  isOpen: boolean;
  onClose: () => void;
  floorMapId?: string | null;
}

function resolveDayConfig(dayStr?: string | null): { label: string; className: string } {
  if (!dayStr) {
    return {
      label: "Both Days",
      className: "bg-white text-[#111215] border border-zinc-200"
    };
  }

  const normalized = dayStr.replace(/[\s-]+/g, "_").toUpperCase();

  if (normalized.includes("1") && !normalized.includes("2")) {
    return {
      label: "Day 1 (Sabtu)",
      className: "bg-[#5398DA] text-[#111215]"
    };
  }

  if (normalized.includes("2") && !normalized.includes("1")) {
    return {
      label: "Day 2 (Minggu)",
      className: "bg-[#D6F834] text-[#111215]"
    };
  }

  return {
    label: "Day 1 & Day 2",
    className: "bg-white text-[#111215] border border-zinc-200"
  };
}

function resolveRatingBadge(rating?: string | null) {
  const norm = (rating || "GA").toUpperCase();
  if (norm.includes("M") || norm.includes("18")) {
    return {
      label: "M (18+)",
      className: "bg-[#F84632]/10 text-[#F84632] border border-[#F84632]/30"
    };
  }
  if (norm.includes("PG")) {
    return {
      label: "PG",
      className: "bg-[#5398DA]/10 text-[#5398DA] border border-[#5398DA]/30"
    };
  }
  return {
    label: "GA",
    className: "bg-zinc-100 text-zinc-700 border border-zinc-200"
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Pembersih teks bio/catatan circle:
 * Menghapus baris-baris data mentah (Booth:, Fandom:, Rating:, Kategori:, Circle Cut URL mentah, Instagram:, dll.)
 * agar kotak bio hanya memuat narasi deskripsi asli dari kreator tanpa duplikasi dan tanpa leak URL backend.
 */
function cleanCircleBio(notes?: string | null): string {
  if (!notes) return "Circle kreator ini belum menambahkan catatan bio tambahan.";

  const lines = notes.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const cleanLines = lines.filter((line) => {
    if (
      /^(Booth|Fandom|Rating|Kategori|Categories|Circle Cut|X\/Twitter|Twitter|Instagram|Facebook|Pixiv|Tiktok|Website|Marketplace|Bio|Description):\s*/i.test(
        line
      )
    ) {
      return false;
    }
    if (line.startsWith("http://") || line.startsWith("https://")) {
      return false;
    }
    return true;
  });

  const cleaned = cleanLines.join("\n").trim();
  return cleaned || "Circle kreator ini belum menambahkan catatan bio tambahan.";
}

export function CircleCatalogModal({
  circle,
  isOpen,
  onClose,
  floorMapId
}: CircleCatalogModalProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [copiedPoId, setCopiedPoId] = useState<string | null>(null);
  const [copiedCircleLink, setCopiedCircleLink] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const parsedMeta = useMemo(() => {
    if (!circle) return null;
    return parseCircleNotes(circle.notes, circle.socialLink);
  }, [circle]);

  const circleCutUrl =
    circle?.circleCutUrl ||
    parsedMeta?.circleCutUrl ||
    circle?.products?.find((p) => p.imageUrl)?.imageUrl ||
    null;

  const formattedCircleCut = useMemo(() => {
    return formatCircleImageUrl(circleCutUrl);
  }, [circleCutUrl]);

  const socialLinks = useMemo(() => {
    if (!circle) return [];
    if (circle.socialLinks && circle.socialLinks.length > 0) {
      return circle.socialLinks;
    }
    return parsedMeta?.socialLinks || [];
  }, [circle, parsedMeta]);

  const boothCode =
    circle?.boothCode ||
    circle?.locations?.[0]?.boothCode ||
    "TBA";

  const rawDay = circle?.day || circle?.locations?.[0]?.day || "ALL_DAYS";
  const dayConfig = resolveDayConfig(rawDay);

  const rating = circle?.rating || parsedMeta?.rating || "GA";
  const ratingBadge = resolveRatingBadge(rating);

  const effectiveFloorMapId =
    floorMapId || circle?.locations?.[0]?.floorMapId || null;

  const rawFandom = circle?.fandom || parsedMeta?.fandom;
  const fandom = rawFandom?.replace(/\s*\(\s*-\s*\)/g, "").trim() || null;
  const categories =
    circle?.categories && circle.categories.length > 0
      ? circle.categories
      : parsedMeta?.categories || [];

  const cleanBioText = useMemo(() => {
    return cleanCircleBio(circle?.notes);
  }, [circle?.notes]);

  const products = useMemo(() => circle?.products || [], [circle?.products]);

  // Koleksi gambar untuk Lightbox Viewer Full Resolution
  const galleryItems = useMemo(() => {
    if (!circle) return [];
    const items: Array<{ src: string; title: string; subtitle?: string }> = [];

    if (formattedCircleCut) {
      items.push({
        src: formattedCircleCut,
        title: `Circle Cut · ${circle.name}`,
        subtitle: `Booth ${boothCode} · ${dayConfig.label}`
      });
    }

    products.forEach((p, idx) => {
      if (p.imageUrl && p.imageUrl.startsWith("http")) {
        const url = formatCircleImageUrl(p.imageUrl);
        if (url && !items.some((it) => it.src === url)) {
          items.push({
            src: url,
            title: `Karya #${String(idx + 1).padStart(2, "0")} · ${circle.name}`,
            subtitle: p.price > 0 ? formatCurrency(p.price) : `Booth ${boothCode}`
          });
        }
      }
    });

    return items;
  }, [circle, formattedCircleCut, products, boothCode, dayConfig.label]);

  // Keyboard navigation & body scroll lock (Escape & Panah Kiri/Kanan)
  useEffect(() => {
    if (!isOpen) {
      setLightboxIndex(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight" && lightboxIndex !== null) {
        setLightboxIndex((curr) =>
          curr !== null ? (curr + 1) % galleryItems.length : null
        );
      } else if (e.key === "ArrowLeft" && lightboxIndex !== null) {
        setLightboxIndex((curr) =>
          curr !== null
            ? (curr - 1 + galleryItems.length) % galleryItems.length
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, lightboxIndex, galleryItems.length]);

  if (!isOpen || !circle) return null;

  const handleCopyPo = async (productId: string, notes: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(notes);
      }
      setCopiedPoId(productId);
      toast.success("Catatan penukaran PO berhasil disalin!");
      setTimeout(() => setCopiedPoId(null), 2000);
    } catch {
      toast.error("Gagal menyalin catatan PO.");
    }
  };

  const handleCopyCircleLink = async () => {
    if (!circle) return;
    try {
      const shareUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/circles/${circle.id}`
          : "";
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedCircleLink(true);
      toast.success("Tautan circle berhasil disalin ke clipboard!");
      setTimeout(() => setCopiedCircleLink(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan circle.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
        <motion.div
          key="circle-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            if (lightboxIndex !== null) setLightboxIndex(null);
            else onClose();
          }}
          className="fixed inset-0 bg-[#07090E]/85 backdrop-blur-md"
          aria-hidden="true"
        />
        <motion.div
          key={`circle-modal-content-${circle.id}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="circle-catalog-modal-title"
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 12 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 12 }
          }
          transition={{
            opacity: { duration: 0.15, ease: "easeOut" },
            scale: { type: "spring", stiffness: 360, damping: 26 },
            y: { type: "spring", stiffness: 360, damping: 26 }
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex w-full max-w-4xl max-h-[92vh] flex-col rounded-3xl border border-zinc-200 bg-[#FFFFFF] shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div
            className="border-b border-zinc-200 bg-[#FFFFFF] px-5 sm:px-7 py-5"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (formattedCircleCut) {
                      setLightboxIndex(0);
                    }
                  }}
                  title={
                    formattedCircleCut
                      ? "Klik untuk melihat foto circle cut resolusi penuh"
                      : undefined
                  }
                  className="group relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-zinc-200 bg-zinc-100 shadow-sm transition hover:border-[#111215]"
                >
                  {formattedCircleCut ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formattedCircleCut}
                      alt={circle.name}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "h-full w-full items-center justify-center bg-[#111215] text-[#D6F834] font-[var(--font-display)] text-3xl uppercase tracking-wider",
                      formattedCircleCut ? "hidden" : "flex"
                    )}
                  >
                    {getInitials(circle.name)}
                  </div>
                </button>
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      title={`Kode Booth: ${boothCode}`}
                      className="inline-flex items-center rounded-lg bg-[#111215] px-3 py-1 font-mono text-xs sm:text-sm font-black tracking-wider text-[#D6F834] uppercase border border-white/10 shadow-xs"
                    >
                      BOOTH {boothCode}
                    </span>

                    <span
                      className={cn(
                        "rounded-full px-3 py-1 font-mono text-xs font-black uppercase tracking-wider shadow-2xs",
                        dayConfig.className
                      )}
                    >
                      {dayConfig.label}
                    </span>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider",
                        ratingBadge.className
                      )}
                    >
                      {ratingBadge.label}
                    </span>
                  </div>
                  <h2
                    id="circle-catalog-modal-title"
                    className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111215] leading-none pt-0.5"
                  >
                    {circle.name}
                  </h2>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup katalog circle"
                  className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-[#111215] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#F84632] active:scale-[0.98] shadow-xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  TUTUP
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
              {effectiveFloorMapId ? (
                <Link
                  href={`/maps/${effectiveFloorMapId}?circleId=${circle.id}`}
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[#5398DA] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#111215] transition hover:bg-[#4083c2] active:scale-[0.98] shadow-2xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  PETA MEJA
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleCopyCircleLink}
                aria-label="Salin tautan profil circle"
                className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-300 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#111215] hover:border-[#111215] hover:bg-[#111215] hover:text-white transition active:scale-[0.98] shadow-2xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
              >
                {copiedCircleLink ? "TERSALIN!" : "SALIN TAUTAN"}
              </button>

              {socialLinks.map((link) => (
                <a
                  key={`${link.platform}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#111215] hover:border-[#111215] hover:bg-[#111215] hover:text-white transition active:scale-[0.98] shadow-2xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7 bg-[#FFFFFF]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <section className="space-y-3 rounded-2xl bg-zinc-50 p-5 border border-zinc-200">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-zinc-500 border-b border-zinc-200 pb-3">
                {fandom ? (
                  <span>
                    FANDOM: <strong className="text-[#111215] font-bold">{fandom}</strong>
                  </span>
                ) : null}
                {categories.length > 0 ? (
                  <span>
                    KATEGORI: <strong className="text-[#111215] font-bold">{categories.join(", ")}</strong>
                  </span>
                ) : null}
              </div>
              <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-700 whitespace-pre-line">
                {cleanBioText}
              </p>
            </section>
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-black tracking-tight text-[#111215] uppercase">
                  KATALOG KARYA
                </h3>
                <span className="font-mono text-xs font-bold text-zinc-500 uppercase">
                  {products.length} KARYA TERDAFTAR
                </span>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product, pIdx) => {
                    const numberLabel = `#${String(pIdx + 1).padStart(2, "0")}`;
                    const formattedImg = formatCircleImageUrl(product.imageUrl);
                    const targetGalleryIdx = galleryItems.findIndex(
                      (item) => item.src === formattedImg
                    );

                    return (
                      <article
                        key={product.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-[#F84632]/50 hover:shadow-xl hover:shadow-[#F84632]/5 cursor-pointer select-none"
                        onClick={() => {
                          if (targetGalleryIdx !== -1) {
                            setLightboxIndex(targetGalleryIdx);
                          } else if (formattedImg) {
                            setLightboxIndex(0);
                          }
                        }}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          title={`Klik untuk melihat Karya ${numberLabel} dalam resolusi penuh`}
                          className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 cursor-zoom-in"
                        >
                          <ProductImage
                            src={product.imageUrl}
                            alt={`Karya ${numberLabel} - ${circle.name}`}
                            className="h-full w-full rounded-none border-0 transition duration-300 group-hover:scale-105"
                            imageClassName="object-cover"
                            fallbackLabel="No preview"
                            loading="eager"
                          />
                          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                            <span className="inline-flex items-center rounded-lg bg-black/80 px-2.5 py-1 font-mono text-xs font-black tracking-wider text-white backdrop-blur-md border border-white/20 shadow-md">
                              {numberLabel}
                            </span>
                          </div>
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2.5 right-2.5 z-10"
                          >
                            <WishlistHeartButton
                              productId={product.id}
                              productName={product.name}
                              size="sm"
                              className="bg-white/95 text-zinc-800 shadow-md border border-zinc-200 hover:text-rose-600 rounded-full p-2"
                            />
                          </div>
                          {product.price > 0 ? (
                            <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
                              <span className="inline-flex items-center rounded-lg bg-[#D6F834] px-2.5 py-1 font-mono text-xs font-black tracking-tight text-[#111215] shadow-md border border-black/10">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          ) : null}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
                            <span className="font-mono text-[11px] font-black text-white uppercase tracking-wider drop-shadow-sm">
                              Klik untuk Zoom
                            </span>
                          </div>
                        </div>
                        {product.poPickupNotes ? (
                          <div
                            className="p-3 bg-white border-t border-zinc-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="rounded-xl border border-dashed border-[#5398DA]/50 bg-[#5398DA]/5 p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#111215]">
                                  SLIP PENGAMBILAN PO
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyPo(product.id, product.poPickupNotes!);
                                  }}
                                  className="min-h-[36px] sm:min-h-0 inline-flex items-center rounded-md bg-[#111215] px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-white hover:bg-[#F84632] transition active:scale-[0.98] select-none"
                                >
                                  {copiedPoId === product.id ? "TERSALIN!" : "SALIN"}
                                </button>
                              </div>
                              <p className="font-mono text-xs font-bold text-[#111215] break-words select-all leading-snug">
                                {product.poPickupNotes}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center bg-zinc-50">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                    KATALOG KARYA
                  </p>
                  <p className="mt-1 font-sans text-sm text-zinc-600 font-medium">
                    Circle ini belum mendaftarkan katalog karya spesifik di ComiPocket.
                  </p>
                </div>
              )}
            </section>
          </div>
          <div
            className="border-t border-zinc-200 bg-[#FFFFFF] px-5 sm:px-7 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <p className="font-mono text-xs font-bold text-zinc-500 text-center sm:text-left uppercase">
              BOOTH {boothCode} · {dayConfig.label} · {products.length} KARYA
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {effectiveFloorMapId ? (
                <Link
                  href={`/maps/${effectiveFloorMapId}?circleId=${circle.id}`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#5398DA] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#111215] hover:bg-[#4083c2] transition active:scale-[0.98] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
                >
                  PETA MEJA
                </Link>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup katalog circle"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#111215] px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-[#F84632] transition active:scale-[0.98] shadow-xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
              >
                TUTUP
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <motion.div
          key="full-resolution-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Preview foto resolusi penuh"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-5xl items-center justify-between gap-4 text-white pb-3 border-b border-white/20"
          >
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold uppercase tracking-wide truncate text-[#D6F834]">
                {galleryItems[lightboxIndex].title}
              </h3>
              <p className="font-mono text-xs text-white/60">
                {galleryItems[lightboxIndex].subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-xs font-bold text-white/75 bg-white/10 px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {galleryItems.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Tutup preview lightbox"
                className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-white/15 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-[#F84632] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                TUTUP
              </button>
            </div>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-1 items-center justify-center p-2 sm:p-4 w-full max-w-5xl max-h-[82vh]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryItems[lightboxIndex].src}
              alt={galleryItems[lightboxIndex].title}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl drop-shadow-2xl"
            />
            {galleryItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((curr) =>
                      curr !== null
                        ? (curr - 1 + galleryItems.length) % galleryItems.length
                        : null
                    )
                  }
                  aria-label="Gambar Sebelumnya"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-black/60 p-3 font-mono text-sm font-bold text-white backdrop-blur-md hover:bg-black/90 transition active:scale-[0.98] border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
                  title="Gambar Sebelumnya"
                >
                  PREV
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((curr) =>
                      curr !== null ? (curr + 1) % galleryItems.length : null
                    )
                  }
                  aria-label="Gambar Selanjutnya"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-black/60 p-3 font-mono text-sm font-bold text-white backdrop-blur-md hover:bg-black/90 transition active:scale-[0.98] border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]"
                  title="Gambar Selanjutnya"
                >
                  NEXT
                </button>
              </>
            )}
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-center font-mono text-[11px] text-white/50 pt-2"
          >
            Gunakan tombol panah keyboard atau tombol PREV / NEXT untuk beralih gambar. Klik di luar gambar untuk menutup.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
