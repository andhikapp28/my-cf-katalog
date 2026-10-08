import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#FFFFFF] text-[#111215] pt-16 pb-8 transition-colors">
      <div className="container-shell max-w-7xl mx-auto space-y-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 items-start justify-between">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-[var(--font-display)] text-2xl font-black tracking-tight text-[#111215]">
                ComiPocket
              </span>
              <span className="rounded-full bg-[#111215] px-2.5 py-0.5 text-[11px] font-mono font-bold text-white uppercase">
                Guide
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-600">
              Katalog personal, denah booth ICE BSD, checklist belanja, dan companion guide Comic Frontier (Comifuro). Dirancang 100% offline-ready untuk kelancaran berburu karya di venue.
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              Designed &amp; Built by{" "}
              <a
                href="mailto:andhikapp28@gmail.com"
                className="font-semibold text-zinc-900 hover:text-[#5398DA] hover:underline"
              >
                Andhika Putra Pratama
              </a>
            </p>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900">
              Navigasi Cepat
            </p>
            <ul className="space-y-1 text-sm font-medium text-zinc-600">
              <li>
                <Link href="/" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Dashboard & Pulse
                </Link>
              </li>
              <li>
                <Link href="/products" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Katalog Karya
                </Link>
              </li>
              <li>
                <Link href="/circles" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Direktori Circle
                </Link>
              </li>
              <li>
                <Link href="/maps" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Peta Denah ICE BSD
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Wishlist & Checklist
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900">
              Sistem & Komunitas
            </p>
            <ul className="space-y-1 text-sm font-medium text-zinc-600">
              <li>
                <Link href="/events" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Arsip Comic Frontier
                </Link>
              </li>
              <li>
                <Link href="/docs" className="inline-flex min-h-[36px] items-center hover:text-[#111215] transition-colors py-1">
                  Dokumentasi Panduan
                </Link>
              </li>
              <li>
                <span className="inline-flex min-h-[36px] items-center text-xs font-mono text-zinc-500 py-1">
                  PWA Companion &amp; Offline Catalog
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="relative w-full border-t border-[#E5E5E5] pt-12 sm:pt-16 md:pt-20 overflow-visible">
          <div className="relative overflow-visible select-none text-center px-2 pt-6 sm:pt-8 md:pt-10">
            <span className="block font-[var(--font-display)] font-black text-5xl sm:text-8xl md:text-9xl lg:text-[9.5rem] xl:text-[11.5rem] tracking-tighter text-[#F84632] leading-none uppercase select-none">
              COMIPOCKET
            </span>
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-visible">
              <Image
                src="/mascot.png"
                alt="ComiPocket Mascot Footer"
                width={260}
                height={270}
                unoptimized
                className="h-36 sm:h-48 md:h-56 lg:h-64 w-auto object-contain drop-shadow-xl select-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-zinc-100 pt-4 text-xs font-mono text-zinc-500 sm:flex-row">
            <p>© 2026 ComiPocket. Comic Frontier Companion Guide.</p>
            <p>ICE BSD City, Tangerang · Offline First PWA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
