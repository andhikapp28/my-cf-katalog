"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  isCircleInWishlist,
  isInWishlist,
  subscribeWishlist,
  toggleCircleWishlist,
  toggleWishlist
} from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export function WishlistHeartButton({
  productId,
  productName,
  className,
  size = "md",
  showLabel = false,
  isCircle = false,
  circleProductIds
}: {
  productId: string;
  productName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  isCircle?: boolean;
  circleProductIds?: string[];
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

  const active =
    mounted &&
    (isCircle
      ? isCircleInWishlist(productId, circleProductIds, wishlistIds)
      : isInWishlist(productId, wishlistIds));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const willAdd = !active;
    if (isCircle) {
      toggleCircleWishlist(productId, circleProductIds);
    } else {
      toggleWishlist(productId);
    }

    if (willAdd) {
      toast.success(
        productName
          ? `"${productName}" masuk ke Wishlist!`
          : isCircle
            ? "Circle ditambahkan ke Wishlist!"
            : "Karya ditambahkan ke Wishlist!",
        {
          description: "Dapat diakses offline di menu Wishlist saat di ICE BSD."
        }
      );
    } else {
      toast.info(
        productName
          ? `"${productName}" dihapus dari Wishlist`
          : isCircle
            ? "Circle dihapus dari Wishlist"
            : "Karya dihapus dari Wishlist"
      );
    }
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const label = productName
    ? `${active ? "Hapus dari wishlist" : "Tambah ke wishlist"}: ${productName}`
    : (active ? "Hapus dari wishlist" : "Tambah ke wishlist");

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F84632] focus-visible:ring-offset-2 touch-manipulation",
        // Extended hit target for mobile thumbs (R-03: at least 44x44px touch area)
        "relative after:absolute after:-inset-2.5 after:content-[''] after:z-10",
        active
          ? "bg-[#F84632] text-white hover:bg-[#d93826] shadow-sm"
          : "bg-white/90 text-zinc-600 hover:text-[#F84632] hover:bg-white border border-line shadow-xs",
        size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-11 px-4 text-sm min-h-[44px]" : "h-9 w-9 text-xs",
        showLabel && "w-auto min-h-[44px] px-3.5 gap-1.5 font-mono font-bold uppercase",
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
