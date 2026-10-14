import {
  Building2,
  Bus,
  Sparkles,
  Users
} from "lucide-react";

export interface BenefitFacilityItem {
  icon: typeof Bus;
  title: string;
  description: string;
  badge?: string;
}

const DEFAULT_BENEFITS: BenefitFacilityItem[] = [
  {
    icon: Bus,
    title: "Shuttle Bus Gratis Lorena",
    badge: "100% Gratis",
    description: "Rute PP St. Cisauk (Terminal Intermoda) ke Hall 10 ICE BSD, armada bus AC beroperasi 07:00 - 21:30 WIB."
  },
  {
    icon: Users,
    title: "Free Community Area di Hall 5",
    badge: "Akses Terbuka",
    description: "Area pameran karya komunitas kreatif, pameran itasha, dan ruang kumpul terbuka ramah pengunjung."
  },
  {
    icon: Building2,
    title: "Venue Ber-AC & Ruang Ganti Resmi",
    badge: "Fasilitas Resmi",
    description: "Kenyamanan pendingin udara penuh di seluruh hall, bilik ruang ganti cosplayer, dan pos medis darurat."
  }
];

export function EventBenefitsSidebar({
  benefits = DEFAULT_BENEFITS
}: {
  benefits?: BenefitFacilityItem[];
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="border-b border-zinc-100 pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zinc-900" />
          <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900">
            Benefit &amp; Fasilitas Pengunjung
          </h2>
        </div>
        <p className="mt-1 text-xs text-zinc-500 font-normal">
          Fasilitas pendukung resmi untuk menunjang kelancaran kunjungan festival.
        </p>
      </div>

      <div className="space-y-3">
        {benefits.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50/90"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-zinc-900">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="rounded-full bg-zinc-200/70 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
