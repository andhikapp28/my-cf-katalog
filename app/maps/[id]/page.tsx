export const revalidate = 120;

import { notFound } from "next/navigation";
import { Compass, Heart, MapPin, Sparkles, WifiOff } from "lucide-react";
import { FloorMapViewer } from "@/components/maps/floor-map-viewer";
import { getInteractiveMapData } from "@/lib/map-data";

export default async function MapDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const selectedCircleId = typeof query.circleId === "string" ? query.circleId : undefined;

  const data = await getInteractiveMapData(id);

  if (!data || !data.currentMap) {
    notFound();
  }

  const { event, currentMap, allFloorMaps, markers } = data;

  return (
    <div className="container-shell space-y-6 py-6 sm:py-8">
      {/* =================================================================== */}
      {/* HEADER: TANALOKA EDITORIAL TITLE                                    */}
      {/* =================================================================== */}
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5398DA]/15 px-3 py-1 text-xs font-bold text-[#5398DA] border border-[#5398DA]/30">
                <MapPin className="h-3.5 w-3.5" />
                {currentMap.hall ? `${currentMap.hall} · ICE BSD City` : "ICE BSD City"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#D6F834]/15 px-3 py-1 text-xs font-bold text-ink-900 border border-[#D6F834]/40">
                <Sparkles className="h-3 w-3 text-brand-600" />
                {event.name}
              </span>
            </div>

            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-black uppercase tracking-tight text-ink-900 leading-none">
              {currentMap.name}
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-ink-500 leading-relaxed">
              Denah arsitektural {currentMap.name}. Telusuri letak meja circle, periksa rating dan karya sampel,
              serta susun daftar belanja dengan tombol Wishlist.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-2xl border border-line bg-white/80 px-4 py-2.5 text-xs font-bold text-ink-700 shadow-xs">
              <strong className="text-brand-600">{markers.length}</strong> Booth Terdata
            </span>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* INTERACTIVE FLOOR MAP VIEWER COMPONENT                              */}
      {/* =================================================================== */}
      <FloorMapViewer
        name={currentMap.name}
        hall={currentMap.hall}
        imageUrl={currentMap.imageUrl}
        width={currentMap.width}
        height={currentMap.height}
        markers={markers}
        initialCircleId={selectedCircleId}
        currentHallId={currentMap.id}
        halls={allFloorMaps.map((m) => ({ id: m.id, name: m.name, hall: m.hall }))}
      />

      {/* =================================================================== */}
      {/* PANDUAN PENGGUNAAN & VENUE TIPS                                      */}
      {/* =================================================================== */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5398DA]/15 text-[#5398DA]">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-ink-900">Pencarian & Filter Cepat</h3>
          <p className="text-xs text-ink-500 leading-relaxed">
            Ketik nomor meja (mis. <span className="font-[var(--font-mono)] font-bold text-ink-700">A-15a</span>) atau judul fandom untuk langsung menyorot marker di denah.
          </p>
        </div>

        <div className="panel p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4838]/15 text-[#FF4838]">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <h3 className="font-bold text-sm text-ink-900">Integrasi Wishlist Tamu</h3>
          <p className="text-xs text-ink-500 leading-relaxed">
            Klik tombol hati pada detail circle untuk menyimpan ke daftar belanja offline dan menghitung kesiapan uang tunai fisik.
          </p>
        </div>

        <div className="panel p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D6F834]/30 text-ink-900">
            <WifiOff className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-ink-900">100% Siap Dipakai Offline</h3>
          <p className="text-xs text-ink-500 leading-relaxed">
            Denah vektor arsitektural hall tetap tajam dan responsif meskipun jaringan seluler di dalam venue ICE BSD mengalami blackout sinyal.
          </p>
        </div>
      </section>
    </div>
  );
}



