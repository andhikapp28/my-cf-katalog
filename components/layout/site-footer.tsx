import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#FFFFFF] text-[#111215] pt-16 pb-8 transition-colors">
      <div className="container-shell max-w-7xl mx-auto space-y-12">
        {/* Top Info & Navigation Row */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 items-start justify-between">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-[var(--font-display)] text-2xl font-black tracking-tight text-[#111215]">
                ComiPocket
              </span>
              <span className="rounded-full bg-[#F84632] px-2.5 py-0.5 text-[11px] font-mono font-bold text-white uppercase">
                Guide
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-600">
              Katalog personal, denah booth ICE BSD, checklist belanja, dan companion guide Comic Frontier (Comifuro). Dirancang 100% offline-ready untuk kelancaran berburu karya di venue.
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              Designed & Built by{" "}
              <a
                href="mailto:andhikapp28@gmail.com"
                className="font-semibold text-[#F84632] hover:underline"
              >
                Andhika Putra Pratama
              </a>
            </p>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#F84632]">
              Navigasi Cepat
            </p>
            <ul className="space-y-1.5 text-sm font-medium text-zinc-600">
              <li>
                <Link href="/" className="hover:text-[#111215] transition-colors">
                  Dashboard & Pulse
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#111215] transition-colors">
                  Katalog Karya
                </Link>
              </li>
              <li>
                <Link href="/circles" className="hover:text-[#111215] transition-colors">
                  Direktori Circle
                </Link>
              </li>
              <li>
                <Link href="/maps" className="hover:text-[#111215] transition-colors">
                  Peta Denah ICE BSD
                </Link>
              </li>
              <li>
                <Link href="/expenses" className="hover:text-[#111215] transition-colors">
                  Kalkulator Belanja & ATM
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#F84632]">
              Sistem & Admin
            </p>
            <ul className="space-y-1.5 text-sm font-medium text-zinc-600">
              <li>
                <Link href="/admin" className="hover:text-[#111215] transition-colors">
                  Admin Control Panel
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#111215] transition-colors">
                  Arsip Comic Frontier
                </Link>
              </li>
              <li>
                <span className="text-xs font-mono text-zinc-400">
                  Built with Next.js, Drizzle & PostgreSQL
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* TANALOKA Big Display Typography: COMIPOCKET in Coral Red (#F84632) */}
        <div className="w-full border-t border-[#E5E5E5] pt-8">
          <div className="overflow-hidden select-none text-center">
            <span className="block font-[var(--font-display)] font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] tracking-tighter text-[#F84632] leading-none uppercase">
              COMIPOCKET
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-zinc-100 pt-4 text-xs font-mono text-zinc-400 sm:flex-row">
            <p>© 2026 ComiPocket. Comic Frontier Companion Guide.</p>
            <p>ICE BSD City, Tangerang · Offline First PWA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
