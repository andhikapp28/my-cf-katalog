export const revalidate = 120;

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getCircleList } from "@/db/queries";
import { getPageParam, getSearchParam, paginateItems, type SearchParams } from "@/lib/admin-ui";

export default async function CirclesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchParam(params, "q");
  const pageParam = getPageParam(params);

  const circles = await getCircleList();

  const filteredCircles = circles.filter((circle) => {
    if (!q) return true;
    const query = q.toLowerCase();
    return (
      circle.name.toLowerCase().includes(query) ||
      (circle.notes && circle.notes.toLowerCase().includes(query))
    );
  });

  const pagination = paginateItems(filteredCircles, pageParam, 24);

  if (!circles.length) {
    return (
      <div className="container-shell py-10">
        <EmptyState title="Belum ada circle" description="Tambahkan circle di admin panel atau impor katalog untuk melihat direktori circle." />
      </div>
    );
  }

  return (
    <div className="container-shell space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Circles</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Directory Circle Comifuro</h1>
        </div>
        <form className="w-full sm:w-72">
          <Input name="q" defaultValue={q} placeholder="Cari nama circle / fandom..." />
        </form>
      </div>

      {pagination.totalItems ? (
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
                    <Link href={`/products?circle=${circle.id}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700 hover:bg-brand-50">
                      Lihat karya
                    </Link>
                    {circle.socialLink ? (
                      <Link href={circle.socialLink} target="_blank" className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100">
                        Media sosial
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
            query={{ q }}
          />
        </>
      ) : (
        <EmptyState title="Circle tidak ditemukan" description="Coba ubah kata kunci pencarian circle." />
      )}
    </div>
  );
}


