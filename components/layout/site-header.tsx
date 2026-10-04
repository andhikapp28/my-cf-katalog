"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/products", label: "Products" },
  { href: "/circles", label: "Circles" },
  { href: "/maps", label: "Floor Maps" },
  { href: "/expenses", label: "Expenses" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-[#5398DA]/85 backdrop-blur-md transition-colors duration-200">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-[var(--font-display)] text-xl font-black tracking-tight text-white group-hover:text-[#D6F834] transition-colors">
              ComiPocket
            </span>
            <span className="rounded-full bg-[#D6F834] px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase text-[#111215] shadow-xs">
              Comifuro
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1 text-sm font-semibold transition-colors duration-150",
                    isActive
                      ? "text-white font-bold"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="text-xs font-mono font-bold text-white/90 hover:text-white md:hidden"
          >
            KATALOG
          </Link>
          <Button
            asChild
            className="rounded-full bg-[#D6F834] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#111215] hover:bg-[#cef338] transition-all shadow-xs border-0"
          >
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
