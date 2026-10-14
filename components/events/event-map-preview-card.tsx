import Link from "next/link";
import { ArrowUpRight, Compass, MapPin } from "lucide-react";

export function EventMapPreviewCard({
  mapHref,
  hallsText = "Hall 5, 6, 7, 8, 9, 10"
}: {
  mapHref: string;
  hallsText?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950 p-5 sm:p-6 text-white shadow-xs space-y-4">
      {/* Background Graphic Accents */}
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#D6F834]" />
            <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              Akses Denah &amp; Peta Event
            </h2>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white border border-white/20">
            Peta Interaktif
          </span>
        </div>

        {/* Mini Preview Schematic Box */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-3.5 backdrop-blur-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
            <span className="flex items-center gap-1.5 font-bold">
              <MapPin className="h-3 w-3 text-[#D6F834]" />
              {hallsText}
            </span>
            <span className="text-zinc-400">ICE BSD City</span>
          </div>

          {/* Simple Hall Blocks Wireframe */}
          <div className="grid grid-cols-6 gap-1 pt-1">
            <div className="rounded-lg bg-white/10 py-2 text-center font-mono text-[10px] font-bold text-zinc-300 border border-white/10">
              H5
            </div>
            <div className="rounded-lg bg-[#D6F834]/20 py-2 text-center font-mono text-[10px] font-bold text-[#D6F834] border border-[#D6F834]/30">
              H6
            </div>
            <div className="rounded-lg bg-white/10 py-2 text-center font-mono text-[10px] font-bold text-zinc-300 border border-white/10">
              H7
            </div>
            <div className="rounded-lg bg-white/10 py-2 text-center font-mono text-[10px] font-bold text-zinc-300 border border-white/10">
              H8
            </div>
            <div className="rounded-lg bg-white/10 py-2 text-center font-mono text-[10px] font-bold text-zinc-300 border border-white/10">
              H9
            </div>
            <div className="rounded-lg bg-white/10 py-2 text-center font-mono text-[10px] font-bold text-zinc-300 border border-white/10">
              H10
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-normal">
          Cari posisi meja circle incaran, rute lorong antar-hall, dan titik fasilitas umum dengan navigasi denah interaktif ComiPocket.
        </p>

        <Link
          href={mapHref}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#D6F834] px-4 py-2.5 font-mono text-xs font-black uppercase text-zinc-950 transition hover:bg-[#cbf128] shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Buka Peta Event</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
