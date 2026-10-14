import {
  CreditCard,
  Ghost,
  Package,
  Sparkles,
  Users
} from "lucide-react";

export interface HighlightCardData {
  category: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
}

const DEFAULT_HIGHLIGHTS: HighlightCardData[] = [
  {
    category: "Area Komunitas",
    title: "Hall 5 Free Community Booths",
    description:
      "Ruang pameran gratis khusus komunitas kreatif independen, itasha display, dan game developer lokal tanpa pungutan biaya stan.",
    icon: Users
  },
  {
    category: "Cosplay & Panggung",
    title: "Halloween Cosplay Parade",
    description:
      "Parade kostum tematik Halloween sepanjang koridor Hall 6 hingga 10 dengan sesi runway dan showcase di panggung utama festival.",
    icon: Ghost
  },
  {
    category: "Merchandise Resmi",
    title: "Official Goods CF23",
    description:
      "Koleksi merchandise eksklusif edisi terbatas Comifuro 23, mencakup artbook katalog kurasi, kaos tema Halloween, dan tote bag maskot.",
    icon: Package
  },
  {
    category: "Transportasi & Mitra",
    title: "KAI Commuter KMT Edisi Khusus",
    description:
      "Kartu Multi Trip (KMT) KAI Commuter bertema khusus maskot Comic Frontier, dapat digunakan langsung di Stasiun Cisauk dan seluruh jaringan KRL Jabodetabek.",
    icon: CreditCard
  }
];

export function EventHighlightsSection({
  highlights = DEFAULT_HIGHLIGHTS,
  eventName
}: {
  highlights?: HighlightCardData[];
  eventName?: string;
}) {
  return (
    <section
      aria-labelledby="highlights-heading"
      className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6"
    >
      <div className="border-b border-zinc-100 pb-5">
        <h2
          id="highlights-heading"
          className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900"
        >
          Program Khusus &amp; Bintang Tamu
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 font-normal">
          Rangkaian agenda resmi, program komunitas, dan kolaborasi eksklusif {eventName || "Comic Frontier"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <article
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 transition-all hover:border-zinc-300 hover:bg-zinc-50/90 shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {item.category}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="font-mono text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
