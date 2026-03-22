export const revalidate = 120;

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProductCard } from "@/components/products/product-card";
import { getBooths, getCircleList, getEventList, getProducts } from "@/db/queries";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const priority = typeof params.priority === "string" ? params.priority : undefined;
  const circleId = typeof params.circle === "string" ? params.circle : undefined;
  const eventId = typeof params.event === "string" ? params.event : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const view = typeof params.view === "string" ? params.view : "grid";

  const [products, circles, events, booths] = await Promise.all([
    getProducts({ q, status, priority, circleId, eventId, sort }),
    getCircleList(),
    getEventList(),
    getBooths(eventId)
  ]);

  const boothMap = new Map(booths.map((item) => [`${item.eventId}:${item.circleId}`, item.boothCode]));

  return (
    <div className="container-shell space-y-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Catalog</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-tight">Target product list</h1>
      </div>

      <form className="panel grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-6">
        <Input name="q" defaultValue={q} placeholder="Search product" />
        <Select name="status" defaultValue={status}>
          <option value="">All status</option>
          <option value="TARGET">TARGET</option>
          <option value="PO_OPEN">PO OPEN</option>
          <option value="PO_DONE">PO DONE</option>
          <option value="PURCHASED">PURCHASED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="SOLD_OUT">SOLD OUT</option>
        </Select>
        <Select name="priority" defaultValue={priority}>
          <option value="">All priority</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </Select>
        <Select name="circle" defaultValue={circleId}>
          <option value="">All circles</option>
          {circles.map((circle) => (
            <option key={circle.id} value={circle.id}>
              {circle.name}
            </option>
          ))}
        </Select>
        <Select name="event" defaultValue={eventId}>
          <option value="">All events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-3">
          <Select name="sort" defaultValue={sort}>
            <option value="deadline">Sort: deadline</option>
            <option value="price">Sort: price</option>
            <option value="updated">Sort: latest update</option>
          </Select>
          <input type="hidden" name="view" value={view} />
          <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">
            Apply
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between rounded-full border border-line bg-white/90 px-4 py-3 text-sm shadow-soft md:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Visible Items</p>
          <p className="font-semibold text-ink-900">{products.length} results</p>
        </div>
        <Link href="/expenses" className="rounded-full bg-brand-500 px-4 py-2 font-medium text-white">
          Add spend
        </Link>
      </div>

      {products.length ? (
        view === "list" ? (
          <div className="space-y-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="panel flex items-center justify-between gap-4 p-4 hover:border-brand-300"
              >
                <div>
                  <p className="font-semibold text-ink-900">{product.name}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {product.circle.name} - Booth {boothMap.get(`${product.eventId}:${product.circleId}`) || "-"}
                  </p>
                </div>
                <div className="text-right text-sm text-ink-700">
                  <p>{product.status}</p>
                  <p className="mt-1 font-medium">{product.price.toLocaleString("id-ID")}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                boothCode={boothMap.get(`${product.eventId}:${product.circleId}`) || null}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState title="Produk tidak ditemukan" description="Coba ubah keyword pencarian atau filter yang sedang aktif." />
      )}
    </div>
  );
}
