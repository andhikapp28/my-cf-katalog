"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  subscribeWishlist
} from "@/lib/wishlist";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Katalog" },
  { href: "/maps", label: "Peta Denah" },
  { href: "/wishlist", label: "Wishlist", isWishlist: true },
  { href: "/docs", label: "Docs" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const wishlistCount = mounted ? wishlistIds.length : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-[#5398DA]/90 backdrop-blur-md transition-colors duration-200">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="font-[var(--font-display)] text-2xl font-black tracking-tight text-white transition-colors group-hover:text-[#D6F834]">
              ComiPocket
            </span>
            <span className="rounded-full bg-[#D6F834] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#111215] shadow-xs">
              Comifuro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 py-1 font-mono text-xs font-bold tracking-widest uppercase transition-colors duration-150",
                    isActive
                      ? "font-extrabold text-white"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  <span>{item.label}</span>
                  {item.isWishlist && mounted && wishlistCount > 0 && (
                    <span
                      data-testid="header-wishlist-badge"
                      className="inline-flex items-center gap-1 rounded-full bg-[#F84632] px-2 py-0.5 font-mono text-[10px] font-black leading-none text-white shadow-xs"
                    >
                      ♥ {wishlistCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Nav Links (All 5 Public Items, No Admin Panel) */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 text-xs md:hidden">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs font-bold uppercase transition",
                  isActive
                    ? "bg-white/15 font-black text-white underline underline-offset-4"
                    : "text-white/80 hover:text-white"
                )}
              >
                <span>{item.label}</span>
                {item.isWishlist && mounted && wishlistCount > 0 && (
                  <span className="rounded-full bg-[#F84632] px-1.5 py-0.5 font-mono text-[9px] font-black leading-none text-white">
                    ♥ {wishlistCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
