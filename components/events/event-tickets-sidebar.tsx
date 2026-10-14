import { Check, ExternalLink, Ticket } from "lucide-react";

export interface TicketPackageItem {
  id: string;
  name: string;
  priceFormatted: string;
  badge?: string;
  description: string;
  benefits: string[];
}

const DEFAULT_TICKET_PACKAGES: TicketPackageItem[] = [
  {
    id: "single-day",
    name: "Single Day Pass",
    priceFormatted: "Rp 75.000",
    description: "Akses 1 hari pameran (Day 1 atau Day 2), 100% pembelian online melalui platform resmi Ticket2U.",
    benefits: [
      "Akses Artist Alley di Hall 6, 7, 8, 9, 10",
      "Akses pameran komunitas mandiri di Hall 5",
      "Layanan gratis Shuttle Bus Lorena PP"
    ]
  },
  {
    id: "bundle-goods",
    name: "Bundle Official Goods",
    priceFormatted: "Rp 130.000",
    badge: "Edisi Terbatas",
    description: "Akses 1 hari pameran ditambah merchandise resmi edisi eksklusif Comifuro 23.",
    benefits: [
      "Tiket masuk 1 hari pameran Comifuro 23",
      "Wristband kolektor resmi edisi khusus",
      "Paket merchandise stiker dan katalog resmi"
    ]
  }
];

export function EventTicketsSidebar({
  packages = DEFAULT_TICKET_PACKAGES,
  platform = "Ticket2U",
  ticketUrl = "https://www.ticket2u.id",
  isPastEvent = false
}: {
  packages?: TicketPackageItem[];
  platform?: string;
  ticketUrl?: string;
  isPastEvent?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-zinc-900" />
            <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900">
              {isPastEvent ? "Arsip Paket Tiket" : "Paket Tiket Resmi"}
            </h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700 border border-zinc-200">
            {isPastEvent ? "Arsip Resmi" : platform}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 font-normal">
          {isPastEvent
            ? "Informasi arsip harga tiket resmi pada saat penyelenggaraan edisi ini."
            : "Seluruh penjualan tiket diselenggarakan 100% online tanpa loket tunai di lokasi."}
        </p>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50/90 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-mono text-sm font-bold text-zinc-900">
                {pkg.name}
              </h3>
              {pkg.badge && (
                <span className="rounded-full bg-[#D6F834] px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-950">
                  {pkg.badge}
                </span>
              )}
            </div>

            <p className="font-mono text-lg font-black text-zinc-900">
              {pkg.priceFormatted}
            </p>

            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              {pkg.description}
            </p>

            <ul className="space-y-1.5 pt-1 text-xs text-zinc-600 border-t border-zinc-200/60">
              {pkg.benefits.map((b, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-1">
        {isPastEvent ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-100/70 p-3 text-center">
            <span className="font-mono text-xs font-bold text-zinc-600 uppercase tracking-wider block">
              Penyelenggaraan Selesai
            </span>
            <p className="mt-1 text-[11px] text-zinc-500 font-normal">
              Penjualan tiket untuk edisi ini telah ditutup.
            </p>
          </div>
        ) : (
          <>
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 font-mono text-xs font-bold text-white transition hover:bg-zinc-800 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 active:scale-[0.98]"
            >
              <span>{["Beli Tiket di", platform].filter(Boolean).join(" ")}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 text-center text-[11px] text-zinc-500">
              Penukaran wristband di gate venue mulai pukul 08:00 WIB.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
