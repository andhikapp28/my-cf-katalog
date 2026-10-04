import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/products", label: "Products" },
  { href: "/circles", label: "Circles" },
  { href: "/maps", label: "Floor Maps" },
  { href: "/expenses", label: "Expenses" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/85 backdrop-blur-md">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-[var(--font-display)] text-lg font-bold tracking-tight text-white">
              ComiPocket
            </span>
            <span className="rounded-full bg-[#FF6B4A]/15 px-2.5 py-0.5 text-xs font-mono font-bold text-[#FF6B4A] border border-[#FF6B4A]/30">
              Comifuro
            </span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/70 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/products" className="text-sm font-medium text-white/70 hover:text-white md:hidden">
            Catalog
          </Link>
          <Button
            asChild
            variant="secondary"
            className="border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white font-medium text-sm"
          >
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
