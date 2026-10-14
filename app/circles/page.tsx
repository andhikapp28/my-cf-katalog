export const revalidate = 120;

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getCircleList } from "@/db/queries";
import { getPageParam, getSearchParam, paginateItems, type SearchParams } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export default async function CirclesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchParam(params, "q");
  const eventParam = getSearchParam(params, "event") || getSearchParam(params, "eventId");
  const activeEventSlug = eventParam || "cf22";
  const pageParam = getPageParam(params);

  const circles = await getCircleList(activeEventSlug);

  const filteredCircles = circles.filter((circle) => {
    if (!q) return true;
    const query = q.toLowerCase();
    return (
      circle.name.toLowerCase().includes(query) ||
      (circle.notes && circle.notes.toLowerCase().includes(query))
    );
  });

  const pagination = paginateItems(filteredCircles, pageParam, 24);

  return (
    <div className="container-shell space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Circles</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Directory Circle Comifuro</h1>
        </div>
        <form className="w-full sm:w-72">
          <input type="hidden" name="event" value={activeEventSlug} />
          <Input name="q" defaultValue={q} placeholder="Cari nama circle / fandom..." />
        </form>
      </div>

      {/* Switcher Edisi Event (CF 22 vs CF 23) */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-zinc-200">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
          EDISI EVENT:
        </span>
        <Link
          href={`/circles?event=cf22${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={cn(
            "rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border flex items-center gap-2",
            activeEventSlug === "cf22"
              ? "bg-[#111215] text-[#D6F834] border-[#111215] shadow-xs"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
          )}
        >
          <span>Comic Frontier 22</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-mono",
              activeEventSlug === "cf22"
                ? "bg-white/20 text-white"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            1.477 Circle
          </span>
        </Link>
        <Link
          href={`/circles?event=cf23${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={cn(
            "rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition border flex items-center gap-2",
            activeEventSlug === "cf23"
              ? "bg-[#111215] text-[#D6F834] border-[#111215] shadow-xs"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
          )}
        >
          <span>Comic Frontier 23</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-mono",
              activeEventSlug === "cf23"
                ? "bg-amber-400/20 text-amber-300"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            )}
          >
            Upcoming
          </span>
        </Link>
      </div>

      {activeEventSlug === "cf23" ? (
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 sm:p-12 text-center shadow-sm backdrop-blur-md space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-mono text-xs font-bold text-amber-800 uppercase tracking-wider">
            Status Data: Menunggu Rilis Panitia
          </div>
          <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111215]">
            Katalog & Meja Booth CF23 Belum Dirilis
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-zinc-600">
            Daftar circle kreator terkurasi dan pemetaan nomor meja booth untuk Comic Frontier 23 belum dirilis resmi oleh panitia Comifuro.
            Data akan otomatis diperbarui begitu denah resmi dipublikasikan. Anda dapat menjelajahi arsip katalog Comic Frontier 22 untuk melihat karya dan kreator edisi sebelumnya.
          </p>
          <div className="pt-2">
            <Link
              href="/circles?event=cf22"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111215] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#D6F834] transition hover:bg-zinc-800 shadow-sm active:scale-95"
            >
              <span>Lihat Direktori Comic Frontier 22</span>
            </Link>
          </div>
        </div>
      ) : pagination.totalItems ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pagination.items.map((circle) => (
              <Card key={circle.id}>
                <CardContent className="space-y-4">
                  <div>
                    <Link href={`/circles/${circle.id}`} className="font-[var(--font-display)] text-2xl font-semibold text-ink-900 hover:text-brand-700">
                      {circle.name}
                    </Link>
                    {circle.notes ? <p className="mt-2 text-sm text-ink-500 line-clamp-3">{circle.notes}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/products?circle=${circle.id}&event=${activeEventSlug}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700 hover:bg-brand-50">
                      View items
                    </Link>
                    {circle.socialLink ? (
                      <Link href={circle.socialLink} target="_blank" className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100">
                        Social link
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            pathname="/circles"
            query={{ q, event: activeEventSlug }}
          />
        </>
      ) : (
        <EmptyState title="Circle tidak ditemukan" description="Coba ubah kata kunci pencarian circle." />
      )}
    </div>
  );
}