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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-background/80 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-ink-900">
              Dipa Katalog
            </span>
            <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
              Comifuro
            </span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-ink-700 transition hover:text-brand-600">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/products" className="text-sm text-ink-700 md:hidden">
            Catalog
          </Link>
          <Button asChild variant="secondary">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
