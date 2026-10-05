"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/docs", label: "Documentation" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-[#5398DA]/90 backdrop-blur-md transition-colors duration-200">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-[var(--font-display)] text-2xl font-black tracking-tight text-white group-hover:text-[#D6F834] transition-colors">
              ComiPocket
            </span>
            <span className="rounded-full bg-[#D6F834] px-2.5 py-0.5 text-[10px] font-mono font-black uppercase text-[#111215] shadow-xs">
              Comifuro
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
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
                    "relative py-1 text-xs font-mono font-bold tracking-widest uppercase transition-colors duration-150",
                    isActive
                      ? "text-white font-extrabold"
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

        {/* Mobile Nav Links (3 Items only, No Admin Panel) */}
        <div className="flex items-center gap-4 md:hidden">
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
                  "text-xs font-mono font-bold uppercase transition",
                  isActive ? "text-white underline underline-offset-4" : "text-white/80 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
