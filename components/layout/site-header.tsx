"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  subscribeWishlist
} from "@/lib/wishlist";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/products", label: "Katalog" },
  { href: "/maps", label: "Peta Denah" },
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
            <span className="font-[var(--font-display)] text-2xl font-black tracking-tight text-[#111215] transition-colors group-hover:text-black">
              ComiPocket
            </span>
            <span className="rounded-full bg-[#111215] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#D6F834] shadow-xs">
              Comifuro
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
                    "relative inline-flex min-h-[44px] items-center gap-1.5 py-2 font-mono text-xs font-bold tracking-widest uppercase transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
                    isActive
                      ? "font-extrabold text-[#111215]"
                      : "text-[#111215]/85 hover:text-[#111215]"
                  )}
                >
                  <span>{item.label}</span>
                  {item.isWishlist && mounted && wishlistCount > 0 && (
                    <span
                      data-testid="header-wishlist-badge"
                      className="inline-flex items-center gap-1 rounded-full bg-[#111215] px-2 py-0.5 font-mono text-[10px] font-black leading-none text-[#F84632] shadow-xs"
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
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/wishlist"
            aria-label={`Buka Wishlist (${wishlistCount} item)`}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 font-mono text-xs font-bold uppercase transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]",
              pathname === "/wishlist" || pathname.startsWith("/wishlist/")
                ? "border-[#111215] bg-[#111215] text-[#D6F834] shadow-xs"
                : "border-[#111215]/20 bg-[#111215]/10 text-[#111215] hover:bg-[#111215]/20"
            )}
          >
            <span className="text-[#F84632] font-black">♥</span>
            {mounted && wishlistCount > 0 ? (
              <span
                data-testid="header-wishlist-badge-mobile"
                className="rounded-full bg-[#111215] px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-[#D6F834]"
              >
                {wishlistCount}
              </span>
            ) : (
              <span className="text-[11px] font-extrabold text-[#111215]">Wish</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#111215]/20 bg-[#111215]/10 px-3.5 font-mono text-xs font-bold uppercase text-[#111215] shadow-xs transition hover:bg-[#111215]/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111215]"
          >
            {mobileMenuOpen ? (
              <>
                <X className="h-4 w-4" aria-hidden="true" />
                <span>TUTUP</span>
              </>
            ) : (
              <>
                <Menu className="h-4 w-4" aria-hidden="true" />
                <span>MENU</span>
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
                    "inline-flex min-h-[48px] items-center justify-between rounded-xl px-4 py-3 font-mono text-sm font-bold uppercase transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F834]",
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F84632] px-2.5 py-1 font-mono text-xs font-black leading-none text-white shadow-xs">
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
