"use client";

import { useMemo } from "react";
import { Printer, Download, X } from "lucide-react";
import type { RawCircleEntry } from "./leaflet-map-canvas";

export interface WishlistMapExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistCircles: RawCircleEntry[];
}

export function WishlistMapExportModal({
  isOpen,
  onClose,
  wishlistCircles
}: WishlistMapExportModalProps) {
  // Sort circles naturally by booth code
  const sortedCircles = useMemo(() => {
    return [...wishlistCircles].sort((a, b) => {
      const codeA = (a.circle_code || "").trim();
      const codeB = (b.circle_code || "").trim();
      return codeA.localeCompare(codeB, undefined, {
        numeric: true,
        sensitivity: "base"
      });
    });
  }, [wishlistCircles]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = ["Booth Code", "Circle Name", "Day", "Fandom", "Rating", "Twitter/X", "Instagram"];
    const rows = sortedCircles.map((c) => [
      `"${c.circle_code || ""}"`,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.day || ""}"`,
      `"${(c.fandom || "").replace(/"/g, '""')}"`,
      `"${c.rating || ""}"`,
      `"${c.circle_twitter || ""}"`,
      `"${c.circle_instagram || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comifuro23-wishlist-route.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative max-h-[92vh] max-w-4xl w-full rounded-2xl bg-[#14161C] border border-zinc-800 text-zinc-100 flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#181A20] print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15] text-zinc-950">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Wishlist Map &amp; Printable Route · CF 23
              </h2>
              <p className="text-xs text-zinc-400">
                Format lembar A3 / Checklist belanja ICE BSD City
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-[#5398DA] hover:bg-[#4285C7] px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A3 Layout</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Print Header */}
          <div className="border-b border-zinc-800 print:border-zinc-300 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white print:text-black">
                  COMIC FRONTIER 23 · FLOOR MAP &amp; WISHLIST ROUTE
                </span>
                <span className="rounded bg-[#5398DA] text-white px-2 py-0.5 text-xs font-bold font-mono">
                  ICE BSD
                </span>
              </div>
              <p className="text-xs text-zinc-400 print:text-zinc-600 mt-1">
                Daftar rute stan dan belanja doujin terkurasi · {sortedCircles.length} Circle Terdaftar
              </p>
            </div>

            <div className="text-right text-xs text-zinc-400 print:text-zinc-600 font-mono">
              <span>ICE BSD City Hall 5–10</span>
              <br />
              <span>ComiPocket Companion</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
            <div className="rounded-xl border border-zinc-800 print:border-zinc-300 bg-[#181A20] print:bg-zinc-50 p-3">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">Total Wishlist</span>
              <span className="text-lg font-bold font-mono text-white print:text-black">
                {sortedCircles.length} Circle
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 print:border-zinc-300 bg-[#181A20] print:bg-zinc-50 p-3">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">Day 1 (Sabtu)</span>
              <span className="text-lg font-bold font-mono text-white print:text-black">
                {sortedCircles.filter((c) => c.day?.includes("SAT") || c.day?.includes("Both")).length} Circle
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 print:border-zinc-300 bg-[#181A20] print:bg-zinc-50 p-3">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">Day 2 (Minggu)</span>
              <span className="text-lg font-bold font-mono text-white print:text-black">
                {sortedCircles.filter((c) => c.day?.includes("SUN") || c.day?.includes("Both")).length} Circle
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 print:border-zinc-300 bg-[#181A20] print:bg-zinc-50 p-3">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">Status Tunai (ATM)</span>
              <span className="text-xs font-bold text-amber-400 print:text-amber-800 block mt-1">
                Tarik Tunai Sebelum Hall
              </span>
            </div>
          </div>

          {/* Table of Circles */}
          {sortedCircles.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-[#181A20] p-8 text-center text-zinc-400 text-xs">
              Belum ada circle yang ditambahkan ke wishlist. Buka denah dan tandai circle favoritmu dengan ikon hati!
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 print:border-zinc-300 bg-[#181A20] print:bg-white overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 print:border-zinc-300 bg-[#1F222A] print:bg-zinc-100 text-zinc-300 print:text-zinc-800 font-bold">
                    <th className="py-2.5 px-3 w-10 text-center">Check</th>
                    <th className="py-2.5 px-3 w-24">Booth</th>
                    <th className="py-2.5 px-3">Circle Name</th>
                    <th className="py-2.5 px-3 w-28">Hari</th>
                    <th className="py-2.5 px-3">Fandom / Target Karya</th>
                    <th className="py-2.5 px-3 w-32 print:w-40">Catatan / Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 print:divide-zinc-200">
                  {sortedCircles.map((circle, idx) => (
                    <tr
                      key={circle.id || idx}
                      className="hover:bg-zinc-800/40 print:hover:bg-transparent"
                    >
                      <td className="py-2.5 px-3 text-center">
                        <div className="h-4 w-4 border border-zinc-500 rounded mx-auto" />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#8ec2f5] print:text-blue-800">
                        {circle.circle_code || "-"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white print:text-black">
                        {circle.name || "Circle Kreator"}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 print:text-zinc-700">
                        {circle.day?.toUpperCase().includes("SAT") && !circle.day?.toUpperCase().includes("BOTH")
                          ? "Sabtu (Day 1)"
                          : circle.day?.toUpperCase().includes("SUN") && !circle.day?.toUpperCase().includes("BOTH")
                            ? "Minggu (Day 2)"
                            : "Sabtu & Minggu"}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 print:text-zinc-700">
                        {circle.fandom || "Multi-fandom"}
                      </td>
                      <td className="py-2.5 px-3 border-l border-zinc-800/60 print:border-zinc-300 text-zinc-400 print:text-zinc-500 font-mono text-[11px]">
                        Rp _________
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Emergency Venue Survival Tips */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 print:text-black print:border-zinc-300 print:bg-zinc-50 space-y-1">
            <p className="font-bold">Tips Hunting Comic Frontier 23 di ICE BSD City:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90 print:text-zinc-700">
              <li>Sinyal seluler dan QRIS di dalam Hall 7–9 sering padat. Siapkan uang tunai pecahan pas (Rp 20.000, Rp 50.000).</li>
              <li>Stan incaran utama (Artist Alley Hall 8 / Corporate Hall 9) disarankan dikunjungi pada pagi hari sebelum antrean circle memanjang.</li>
              <li>Denah offline ComiPocket dapat tetap digunakan tanpa kuota internet di ponsel Anda.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
