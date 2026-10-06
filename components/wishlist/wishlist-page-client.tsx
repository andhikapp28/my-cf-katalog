"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Calendar,
  Heart,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  WifiOff,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateWishlistSummary,
  clearPurchasedProducts,
  clearWishlist,
  compareBoothOrder,
  getPurchasedServerSnapshot,
  getPurchasedSnapshot,
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  removeFromWishlist,
  saveWishlistProductIds,
  subscribePurchased,
  subscribeWishlist,
  togglePurchasedProduct
} from "@/lib/wishlist";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { CashReadinessCalculator } from "./cash-readiness-calculator";
import { BoothRecapSection } from "./booth-recap-section";
import { ShareWishlistModal } from "./share-wishlist-modal";
import type { BoothGroup, WishlistProduct, WishlistTabFilter } from "./types";

export function WishlistPageClient({
  initialProducts = [],
  activeEventName = "Comic Frontier (Comifuro)"
}: {
  initialProducts: WishlistProduct[];
  activeEventName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<WishlistTabFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawWishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const rawPurchasedIds = useSyncExternalStore(
    subscribePurchased,
    getPurchasedSnapshot,
    getPurchasedServerSnapshot
  );

  const wishlistIds = useMemo(
    () => (mounted ? rawWishlistIds : []),
    [mounted, rawWishlistIds]
  );
  const purchasedIdSet = useMemo(() => new Set(mounted ? rawPurchasedIds : []), [mounted, rawPurchasedIds]);

  // Product map for quick lookup
  const productMap = useMemo(() => {
    const map = new Map<string, WishlistProduct>();
    for (const p of initialProducts) {
      map.set(p.id, p);
    }
    return map;
  }, [initialProducts]);

  // Active items in wishlist
  const wishlistItems = useMemo(() => {
    const items: WishlistProduct[] = [];
    for (const id of wishlistIds) {
      const found = productMap.get(id);
      if (found) {
        items.push(found);
      }
    }
    return items;
  }, [wishlistIds, productMap]);

  // Items enriched with current purchased flag for calculation
  const itemsForCalc = useMemo(() => {
    return wishlistItems.map((item) => ({
      ...item,
      isPurchased: purchasedIdSet.has(item.id)
    }));
  }, [wishlistItems, purchasedIdSet]);

  // Overall financial & item summary
  const summary = useMemo(() => {
    return calculateWishlistSummary(itemsForCalc);
  }, [itemsForCalc]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: wishlistItems.length,
      DAY_1: wishlistItems.filter(
        (item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === "DAY_1"
      ).length,
      DAY_2: wishlistItems.filter(
        (item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === "DAY_2"
      ).length,
      RUSH: wishlistItems.filter((item) => item.isRush).length
    };
  }, [wishlistItems]);

  // Filter items by tab and search
  const filteredItems = useMemo(() => {
    let result = wishlistItems;

    // Filter by tab
    if (activeTab === "DAY_1") {
      result = result.filter(
        (item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === "DAY_1"
      );
    } else if (activeTab === "DAY_2") {
      result = result.filter(
        (item) => !item.targetDay || item.targetDay === "ALL_DAYS" || item.targetDay === "DAY_2"
      );
    } else if (activeTab === "RUSH") {
      result = result.filter((item) => item.isRush);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.circleName.toLowerCase().includes(q) ||
          (item.boothCode && item.boothCode.toLowerCase().includes(q))
      );
    }

    return result;
  }, [wishlistItems, activeTab, searchQuery]);

  // Group by Booth & natural sort by Hall and boothCode
  const boothGroups = useMemo<BoothGroup[]>(() => {
    const groupMap = new Map<string, BoothGroup>();

    for (const item of filteredItems) {
      const boothKey = `${item.circleId}-${item.boothCode || "unassigned"}`;
      let group = groupMap.get(boothKey);

      if (!group) {
        group = {
          circleId: item.circleId,
          circleName: item.circleName,
          boothCode: item.boothCode || "-",
          hall: item.hall || "Hall ICE",
          floorMapId: item.floorMapId,
          items: [],
          allPurchased: false,
          hasRush: false
        };
        groupMap.set(boothKey, group);
      }

      group.items.push(item);
      if (item.isRush) {
        group.hasRush = true;
      }
    }

    // Sort items within each booth (Rush first, then high priority, then name)
    const groups = Array.from(groupMap.values());
    for (const group of groups) {
      group.items.sort((a, b) => {
        const aRush = a.isRush ? 1 : 0;
        const bRush = b.isRush ? 1 : 0;
        if (aRush !== bRush) return bRush - aRush;
        return a.name.localeCompare(b.name);
      });
      group.allPurchased = group.items.every((it) => purchasedIdSet.has(it.id));
    }

    // Sort booth groups by Hall and booth code
    groups.sort((a, b) => compareBoothOrder(a, b));

    return groups;
  }, [filteredItems, purchasedIdSet]);

  // Handlers
  const handleTogglePurchased = (productId: string) => {
    const isNowBought = togglePurchasedProduct(productId);
    const item = productMap.get(productId);
    if (isNowBought) {
      toast.success(
        item ? `✓ "${item.name}" ditandai sudah dibeli!` : "Ditandai sudah dibeli!",
        { duration: 2000 }
      );
    } else {
      toast.info("Status belanja dibatalkan");
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(productId);
    const item = productMap.get(productId);
    toast.info(item ? `"${item.name}" dihapus dari Wishlist` : "Karya dihapus dari Wishlist");
  };

  const handleResetChecklist = () => {
    if (purchasedIdSet.size === 0) return;
    if (window.confirm("Reset semua centang belanja hari-H? Status karya akan kembali menjadi belum dibeli.")) {
      clearPurchasedProducts();
      toast.success("Checklist belanja berhasil di-reset.");
    }
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) return;
    if (window.confirm("Kosongkan seluruh daftar Wishlist? Aksi ini akan menghapus semua target belanja yang disimpan di browser ini.")) {
      clearWishlist();
      clearPurchasedProducts();
      toast.success("Wishlist telah dikosongkan.");
    }
  };

  const handleLoadDemo = () => {
    // Ambil 4-6 produk contoh dari initialProducts
    if (initialProducts.length === 0) {
      toast.error("Tidak ada data produk katalog.");
      return;
    }
    const sample = initialProducts.slice(0, 5).map((p) => p.id);
    saveWishlistProductIds(sample);
    toast.success("5 contoh karya berhasil dimuat ke Wishlist!", {
      description: "Silakan coba mode checklist, filter, dan kalkulator ATM."
    });
  };

  // Progress metrics
  const totalCount = wishlistItems.length;
  const purchasedCount = wishlistItems.filter((it) => purchasedIdSet.has(it.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  return (
    <div className="container-shell space-y-8 py-8 md:py-10">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-brand-700">
              <Sparkles className="h-3 w-3" />
              100% Zero-Login · LocalStorage
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-800">
              <WifiOff className="h-3 w-3" />
              Offline-ready di ICE BSD
            </span>
          </div>

          <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink-900 leading-none">
            My Wishlist & Checklist
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-ink-500">
            Daftar karya incaran personal kamu untuk {activeEventName}. Disimpan langsung di browser kamu, siap dibuka offline di venue tanpa bergantung pada sinyal ponsel.
          </p>
        </div>

        {/* Action Buttons: Share & Clear */}
        {wishlistItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <ShareWishlistModal
              eventName={activeEventName}
              boothGroups={boothGroups}
              summary={summary}
              purchasedIds={purchasedIdSet}
            />

            <button
              type="button"
              onClick={handleResetChecklist}
              disabled={purchasedIdSet.size === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              title="Reset semua centang belanja kembali ke belum dibeli"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Centang</span>
            </button>

            <button
              type="button"
              onClick={handleClearWishlist}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2.5 font-mono text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus semua item dari Wishlist"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kosongkan</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar Hari-H (Jika ada item di wishlist) */}
      {wishlistItems.length > 0 && (
        <div className="panel p-4 sm:p-5 border-line/80 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white font-mono text-xs font-bold">
                ✓
              </span>
              <span className="font-bold text-ink-900">
                Progress Hunting Venue: {purchasedCount} dari {totalCount} karya terbeli
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-brand-700">
              {progressPercent}% Selesai · Sisa {formatCurrency(summary.remainingTotal)}
            </div>
          </div>

          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-100 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-[#F84632] to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Kalkulator Kesiapan Tunai ATM ICE BSD */}
      {wishlistItems.length > 0 && (
        <CashReadinessCalculator summary={summary} />
      )}

      {/* Controls & Booth List Section */}
      {wishlistItems.length > 0 ? (
        <div className="space-y-6">
          {/* Tab Filters & Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all",
                  activeTab === "ALL"
                    ? "bg-[#111215] text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-line hover:bg-zinc-50"
                )}
              >
                <span>Semua</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  activeTab === "ALL" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                )}>
                  {tabCounts.ALL}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("DAY_1")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all",
                  activeTab === "DAY_1"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-line hover:bg-zinc-50"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Day 1 (Sabtu)</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  activeTab === "DAY_1" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                )}>
                  {tabCounts.DAY_1}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("DAY_2")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all",
                  activeTab === "DAY_2"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-line hover:bg-zinc-50"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Day 2 (Minggu)</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  activeTab === "DAY_2" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                )}>
                  {tabCounts.DAY_2}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("RUSH")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all",
                  activeTab === "RUSH"
                    ? "bg-[#F84632] text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-line hover:bg-zinc-50"
                )}
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>⚡ Rush 10:00</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  activeTab === "RUSH" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                )}>
                  {tabCounts.RUSH}
                </span>
              </button>
            </div>

            {/* Quick Search inside Wishlist */}
            <div className="relative sm:w-64">
              <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari di wishlist..."
                className="w-full rounded-xl border border-line bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-ink-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Booth Recap List */}
          <BoothRecapSection
            boothGroups={boothGroups}
            purchasedIds={purchasedIdSet}
            onTogglePurchased={handleTogglePurchased}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="panel p-10 sm:p-16 text-center space-y-6 max-w-2xl mx-auto border-dashed border-2">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-soft">
            <Heart className="h-10 w-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-[var(--font-display)] text-3xl font-black text-ink-900 sm:text-4xl">
              Wishlist Kamu Masih Kosong
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed max-w-md mx-auto">
              Belum ada karya yang kamu tandai. Kamu bisa menjelajahi katalog karya kreator dan menekan tombol <strong className="text-brand-600">♥ Wishlist</strong> untuk menyimpan target belanja.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-soft hover:bg-brand-600 transition-all active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Jelajahi Katalog Karya</span>
            </Link>

            {initialProducts.length > 0 && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 font-mono text-xs font-bold uppercase text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span>Coba Muat Contoh (Demo)</span>
              </button>
            )}
          </div>

          <div className="pt-6 border-t border-line text-xs text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-700">🔒 Tanpa Login & Bebas Tracking</p>
            <p>Data wishlist tersimpan aman secara offline di browser lokal kamu dan tidak dikirimkan ke server kami.</p>
          </div>
        </div>
      )}
    </div>
  );
}
