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

export function CircleCatalogModal({
  circle,
  isOpen,
  onClose,
  floorMapId
}: CircleCatalogModalProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [copiedPoId, setCopiedPoId] = useState<string | null>(null);
  const [copiedCircleLink, setCopiedCircleLink] = useState(false);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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

  const fandom = circle?.fandom || parsedMeta?.fandom;
  const categories =
    circle?.categories && circle.categories.length > 0
      ? circle.categories
      : parsedMeta?.categories || [];

  const description =
    circle?.description ||
    parsedMeta?.description ||
    circle?.notes ||
    "Circle ini belum mencantumkan bio resmi.";

  if (!isOpen || !circle) return null;

  const products = circle?.products || [];

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
      {isOpen && circle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop Blur Gelap */}
          <motion.div
            key="circle-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111215]/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Pop-up Card */}
          <motion.div
            key={`circle-modal-content-${circle.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="circle-catalog-modal-title"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 16 }
            }
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex w-full max-w-4xl max-h-[92vh] flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="border-b border-zinc-200 bg-zinc-50/80 px-5 sm:px-7 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Circle Cut Thumbnail */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm">
                    {formattedCircleCut ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formattedCircleCut}
                        alt={circle.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        "h-full w-full items-center justify-center bg-[#111215] text-[#D6F834] font-[var(--font-display)] text-2xl uppercase tracking-wider",
                        formattedCircleCut ? "hidden" : "flex"
                      )}
                    >
                      {getInitials(circle.name)}
                    </div>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Badges Row: Booth Code Besar + Day Badge + Rating */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        title={`Kode Booth: ${boothCode}`}
                        className="inline-flex items-center rounded-lg bg-[#111215] px-3 py-1 font-mono text-xs sm:text-sm font-black tracking-wider text-[#D6F834] uppercase border border-white/10 shadow-2xs"
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

                    {/* Nama Circle: Bebas Neue Font Display */}
                    <h2
                      id="circle-catalog-modal-title"
                      className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111215] leading-none pt-1"
                    >
                      {circle.name}
                    </h2>
                  </div>
                </div>

                {/* Tombol Tutup Header (Pure Typography TUTUP Tanpa Ikon) */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-[#111215] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#F84632] active:scale-95 shadow-xs select-none"
                  >
                    TUTUP
                  </button>
                </div>
              </div>

              {/* Sub-Header Actions: Social Links & Peta Meja */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200/80">
                {effectiveFloorMapId ? (
                  <Link
                    href={`/maps/${effectiveFloorMapId}?circleId=${circle.id}`}
                    className="inline-flex items-center rounded-xl bg-[#5398DA] px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-[#111215] transition hover:bg-[#4083c2] active:scale-95 shadow-2xs select-none"
                  >
                    PETA MEJA
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handleCopyCircleLink}
                  className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#111215] hover:border-[#111215] hover:bg-[#111215] hover:text-white transition active:scale-95 shadow-2xs select-none"
                >
                  {copiedCircleLink ? "TERSALIN!" : "SALIN TAUTAN"}
                </button>

                {socialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#111215] hover:border-[#111215] hover:bg-[#111215] hover:text-white transition active:scale-95 shadow-2xs select-none"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* Bio & Deskripsi Circle */}
              <section className="space-y-3 rounded-2xl bg-zinc-50 p-4 sm:p-5 border border-zinc-200/70">
                {(fandom || categories.length > 0) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500 border-b border-zinc-200/80 pb-2">
                    {fandom ? (
                      <span>
                        FANDOM: <strong className="text-[#111215]">{fandom}</strong>
                      </span>
                    ) : null}
                    {categories.length > 0 ? (
                      <span>
                        KATEGORI: <strong className="text-[#111215]">{categories.join(", ")}</strong>
                      </span>
                    ) : null}
                  </div>
                )}
                <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-700 whitespace-pre-line">
                  {description}
                </p>
              </section>

              {/* Daftar Karya & Merchandise */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                  <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-normal tracking-tight text-[#111215]">
                    DAFTAR KARYA & MERCHANDISE
                  </h3>
                  <span className="font-mono text-xs font-bold text-zinc-500">
                    {products.length} KARYA TERDAFTAR
                  </span>
                </div>

                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                      const isZeroPrice = product.price <= 0;

                      return (
                        <article
                          key={product.id}
                          className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-zinc-400 hover:shadow-md"
                        >
                          {/* Foto Karya */}
                          <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full rounded-none border-0"
                              fallbackLabel="No preview"
                            />

                            {/* Tombol Wishlist per Produk */}
                            <div className="absolute top-2 right-2 z-10">
                              <WishlistHeartButton
                                productId={product.id}
                                productName={product.name}
                                size="sm"
                                className="shadow-sm"
                              />
                            </div>
                          </div>

                          {/* Info Produk */}
                          <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-3">
                            <div className="space-y-1">
                              <h4 className="font-sans font-bold text-sm sm:text-base text-[#111215] line-clamp-2 leading-snug">
                                {product.name}
                              </h4>
                            </div>

                            {/* Harga & Tombol Aksi */}
                            <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                              {isZeroPrice ? (
                                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-700">
                                  Sampel Karya
                                </span>
                              ) : (
                                <span className="font-mono text-base font-black tracking-tight text-[#111215]">
                                  {formatCurrency(product.price)}
                                </span>
                              )}

                              {product.productLink ? (
                                <a
                                  href={product.productLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#111215] hover:border-[#111215] hover:bg-[#111215] hover:text-white transition active:scale-95 select-none"
                                >
                                  LIHAT KARYA
                                </a>
                              ) : (
                                <Link
                                  href={`/products/${product.id}`}
                                  className="rounded-lg bg-[#111215] px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-[#F84632] transition active:scale-95 select-none"
                                >
                                  DETAIL
                                </Link>
                              )}
                            </div>

                            {/* Slip PO jika ada catatan pengambilan */}
                            {product.poPickupNotes ? (
                              <div className="rounded-xl border-2 border-dashed border-[#5398DA]/40 bg-[#5398DA]/5 p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#111215]">
                                    SLIP PO
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyPo(product.id, product.poPickupNotes!)
                                    }
                                    className="rounded-md bg-[#111215] px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-white hover:bg-[#F84632] transition active:scale-95 select-none"
                                  >
                                    {copiedPoId === product.id ? "TERSALIN!" : "SALIN"}
                                  </button>
                                </div>
                                <p className="font-mono text-xs font-bold text-[#111215] break-words select-all leading-snug">
                                  {product.poPickupNotes}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center bg-zinc-50/50">
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

            {/* Modal Footer */}
            <div className="border-t border-zinc-200 bg-zinc-50/90 px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-mono text-xs font-bold text-zinc-500 text-center sm:text-left">
                BOOTH {boothCode} · {dayConfig.label} · {products.length} KARYA
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {effectiveFloorMapId ? (
                  <Link
                    href={`/maps/${effectiveFloorMapId}?circleId=${circle.id}`}
                    className="inline-flex items-center rounded-xl bg-[#5398DA] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#111215] hover:bg-[#4083c2] transition active:scale-95 select-none"
                  >
                    PETA MEJA
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center rounded-xl bg-[#111215] px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-[#F84632] transition active:scale-95 shadow-xs select-none"
                >
                  TUTUP
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
