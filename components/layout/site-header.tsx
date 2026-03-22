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
          <Link href="/" className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-ink-900">
            Dipa Katalog
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
