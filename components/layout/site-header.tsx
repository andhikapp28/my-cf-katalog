"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  subscribeWishlist
} from "@/lib/wishlist";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/circles", label: "Circles" },
  { href: "/wishlist", label: "Wishlist", isWishlist: true },
  { href: "/docs", label: "Docs" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const wishlistIds = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot
  );

  const wishlistCount = mounted ? wishlistIds.length : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#5398DA]/95 backdrop-blur-md transition-colors duration-200">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
          >
            <span className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#111215] transition-colors group-hover:text-black">
              ComiPocket
            </span>
            <span className="rounded-full bg-[#111215] px-2.5 py-0.5 font-sans text-[11px] font-bold text-[#D6F834] shadow-xs">
              CF 23
            </span>
          </Link>
          <nav aria-label="Navigasi Utama" className="hidden items-center gap-6 md:flex lg:gap-8">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-[44px] items-center gap-1.5 py-2 font-sans text-sm font-semibold transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
                    isActive
                      ? "font-extrabold text-[#111215]"
                      : "text-[#111215]/80 hover:text-[#111215]"
                  )}
                >
                  <span>{item.label}</span>
                  {item.isWishlist && mounted && wishlistCount > 0 && (
                    <span
                      data-testid="header-wishlist-badge"
                      className="inline-flex items-center gap-1 rounded-full bg-[#111215] px-2 py-0.5 font-sans text-[11px] font-bold leading-none text-[#F84632] shadow-xs"
                    >
                      ♥ {wishlistCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#111215]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Booth Lookup Trigger (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-quick-lookup"))}
            className="group flex min-h-[40px] items-center gap-2 rounded-xl border border-black/15 bg-white/40 px-3.5 py-1.5 font-sans text-xs sm:text-sm text-[#111215] shadow-xs backdrop-blur-xs transition hover:bg-white hover:border-black/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
            title="Cari nomor meja booth atau circle (Shortcut: Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-[#111215]/70 group-hover:text-[#111215]" />
            <span className="font-medium">Cari Booth atau Circle...</span>
            <kbd className="ml-1 rounded border border-black/20 bg-white/70 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#111215]">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-quick-lookup"))}
            aria-label="Cari Booth dan Circle"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#111215]/20 bg-[#111215]/10 text-[#111215] transition active:scale-[0.98] hover:bg-[#111215]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/wishlist"
            aria-label={`Buka Wishlist (${wishlistCount} item)`}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 font-sans text-xs font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
              pathname === "/wishlist" || pathname.startsWith("/wishlist/")
                ? "border-[#111215] bg-[#111215] text-[#D6F834] shadow-xs"
                : "border-[#111215]/20 bg-[#111215]/10 text-[#111215] hover:bg-[#111215]/20"
            )}
          >
            <span className="text-[#F84632] font-black">♥</span>
            {mounted && wishlistCount > 0 ? (
              <span
                data-testid="header-wishlist-badge-mobile"
                className="rounded-full bg-[#111215] px-1.5 py-0.5 font-sans text-[10px] font-bold leading-none text-[#D6F834]"
              >
                {wishlistCount}
              </span>
            ) : (
              <span className="text-xs font-bold text-[#111215]">Wish</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#111215]/20 bg-[#111215]/10 px-3.5 font-sans text-xs font-semibold text-[#111215] shadow-xs transition hover:bg-[#111215]/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
          >
            {mobileMenuOpen ? (
              <>
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Tutup</span>
              </>
            ) : (
              <>
                <Menu className="h-4 w-4" aria-hidden="true" />
                <span>Menu</span>
              </>
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          role="region"
          aria-label="Menu Navigasi Mobile"
          className="border-t border-black/15 bg-[#141720]/98 px-4 py-4 shadow-2xl backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-150"
        >
          <nav aria-label="Daftar Navigasi Mobile" className="flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-[48px] items-center justify-between rounded-xl px-4 py-3 font-sans text-sm font-semibold transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]",
                    isActive
                      ? "bg-white text-[#111215] shadow-md ring-2 ring-white/50"
                      : "text-white/90 hover:bg-white/15 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-[#F84632]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white/40" />
                    )}
                    <span>{item.label}</span>
                  </div>

                  {item.isWishlist && mounted && wishlistCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F84632] px-2.5 py-1 font-sans text-xs font-bold leading-none text-white shadow-xs">
                      ♥ {wishlistCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
