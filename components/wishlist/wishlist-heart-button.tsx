"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  isInWishlist,
  subscribeWishlist,
  toggleWishlist
} from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export function WishlistHeartButton({
  productId,
  productName,
  className,
  size = "md",
  showLabel = false
}: {
  productId: string;
  productName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const active = mounted && isInWishlist(productId, wishlistIds);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const willAdd = !active;
    const ok = toggleWishlist(productId);

    if (ok) {
      if (willAdd) {
        toast.success(
          productName
            ? `"${productName}" masuk ke Wishlist!`
            : "Karya ditambahkan ke Wishlist!",
          {
            description: "Dapat diakses offline di menu Wishlist saat di ICE BSD."
          }
        );
      } else {
        toast.info(
          productName
            ? `"${productName}" dihapus dari Wishlist`
            : "Karya dihapus dari Wishlist"
        );
      }
    }
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      title={active ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 focus:outline-hidden",
        active
          ? "bg-[#F84632] text-white hover:bg-[#d93826] shadow-sm"
          : "bg-white/90 text-zinc-600 hover:text-[#F84632] hover:bg-white border border-line shadow-xs",
        size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-10 px-4 text-sm" : "h-8.5 w-8.5 text-xs",
        showLabel && "w-auto px-3 gap-1.5 font-mono font-bold uppercase",
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          active ? "fill-white text-white" : "text-current"
        )}
      />
      {showLabel && (
        <span>{active ? "Di Wishlist" : "+ Wishlist"}</span>
      )}
    </button>
  );
}
