export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteProductAction, quickUpdateProductStatusAction, upsertProductAction } from "@/actions/products";
import {
  AdminActionButton,
  AdminActionDivider,
  AdminActionDropdown,
  AdminActionLabel,
  AdminActionLink
} from "@/components/admin/admin-action-dropdown";
import { AdminCreatePanel } from "@/components/admin/admin-create-panel";
import { AdminField } from "@/components/admin/admin-field";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSectionHeading } from "@/components/admin/admin-section-heading";
import { ProductImage } from "@/components/products/product-image";
import { ProductImageUrlField } from "@/components/products/product-image-url-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAdminProductsForEvent, getCircleList, getEventList } from "@/db/queries";
import {
  buildPathWithQuery,
  compactUrl,
  formatEnumLabel,
  getPageParam,
  getSearchParam,
  paginateItems,
  type SearchParams
} from "@/lib/admin-ui";
import { priorities, priorityStyles, productStatuses, purchaseTypes, statusStyles } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

const notesClampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden"
};

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = getSearchParam(params, "q");
  const status = getSearchParam(params, "status");
  const eventId = getSearchParam(params, "event");
  const circleId = getSearchParam(params, "circle");
  const priority = getSearchParam(params, "priority");
  const editId = getSearchParam(params, "edit");
  const pageParam = getPageParam(params);

  const [events, circles, products] = await Promise.all([
    getEventList(),
    getCircleList(),
    getAdminProductsForEvent(eventId)
  ]);

  const filteredProducts = products.filter((product) => {
    if (q && !product.name.toLowerCase().includes(q.toLowerCase())) {
      return false;
    }

    if (status && product.status !== status) {
      return false;
    }

    if (circleId && product.circleId !== circleId) {
      return false;
    }

    if (priority && product.priority !== priority) {
      return false;
    }

    return true;
  });

  const pagination = paginateItems(filteredProducts, pageParam, 9);
  const baseQuery = {
    q,
    status,
    event: eventId,
    circle: circleId,
    priority
  };
  const sharedQuery = {
    ...baseQuery,
    page: pagination.page > 1 ? String(pagination.page) : undefined
  };
  const selectedProduct = filteredProducts.find((product) => product.id === editId);

  return (
    <AdminShell
      title="Products"
      description="Kelola target item, gunakan image URL untuk preview produk, update status cepat, dan simpan metadata yang relevan untuk hari event."
    >
      <AdminCreatePanel
        title="Add product"
        description="Panel utama untuk menambah target item baru. Image produk sekarang cukup memakai direct image URL agar lebih ringan dan mudah dikelola."
      >
        <form action={upsertProductAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminField label="Event" required>
            <Select name="eventId" required>
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Circle" required>
            <Select name="circleId" required>
              <option value="">Select circle</option>
              {circles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Product name" required>
            <Input name="name" placeholder="Summer Illustration Book" required />
          </AdminField>
          <AdminField label="Product image URL" className="md:col-span-2 xl:col-span-3">
            <ProductImageUrlField name="imageUrl" />
          </AdminField>
          <AdminField label="Price" required>
            <Input type="number" name="price" placeholder="185000" required />
          </AdminField>
          <AdminField label="Quantity" required>
            <Input type="number" name="quantity" placeholder="1" defaultValue={1} required />
          </AdminField>
          <AdminField label="PO deadline">
            <Input type="date" name="poDeadline" />
          </AdminField>
          <AdminField label="Product link" className="md:col-span-2 xl:col-span-3">
            <Input name="productLink" placeholder="https://instagram.com/..." />
          </AdminField>
          <AdminField label="Status">
            <Select name="status" defaultValue="TARGET">
              {productStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Priority">
            <Select name="priority" defaultValue="MEDIUM">
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Purchase type">
            <Select name="purchaseType" defaultValue="ON_THE_SPOT">
              {purchaseTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
            <Textarea name="notes" placeholder="Catatan produk, reminder pembayaran, atau bundle info." />
          </AdminField>
          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <SubmitButton>Save product</SubmitButton>
          </div>
        </form>
      </AdminCreatePanel>

      <section className="panel p-5 sm:p-6">
        <AdminSectionHeading title="Products grid" description="Filter ringan tetap dipertahankan, tetapi daftar produk sekarang lebih visual dan nyaman dipindai." />
        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))_auto_auto]">
          <AdminField label="Search product name">
            <Input name="q" defaultValue={q} placeholder="Search product" />
          </AdminField>
          <AdminField label="Filter event">
            <Select name="event" defaultValue={eventId}>
              <option value="">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Filter circle">
            <Select name="circle" defaultValue={circleId}>
              <option value="">All circles</option>
              {circles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Filter status">
            <Select name="status" defaultValue={status}>
              <option value="">All status</option>
              {productStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Filter priority">
            <Select name="priority" defaultValue={priority}>
              <option value="">All priority</option>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </AdminField>
          <div className="flex items-end gap-3 xl:col-span-2">
            <Button type="submit">Apply filters</Button>
            <Button asChild variant="secondary">
              <Link href="/admin/products">Reset</Link>
            </Button>
          </div>
        </form>
      </section>

      {selectedProduct ? (
        <AdminCreatePanel
          title={`Edit product: ${selectedProduct.name}`}
          description="Panel edit dipisah dari grid supaya daftar produk tetap bersih dan visual."
        >
          <form action={upsertProductAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input type="hidden" name="id" value={selectedProduct.id} />
            <AdminField label="Event" required>
              <Select name="eventId" defaultValue={selectedProduct.eventId} required>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Circle" required>
              <Select name="circleId" defaultValue={selectedProduct.circleId} required>
                {circles.map((circle) => (
                  <option key={circle.id} value={circle.id}>
                    {circle.name}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Product name" required>
              <Input name="name" defaultValue={selectedProduct.name} required />
            </AdminField>
            <AdminField label="Product image URL" className="md:col-span-2 xl:col-span-3">
              <ProductImageUrlField name="imageUrl" defaultValue={selectedProduct.imageUrl} />
            </AdminField>
            <AdminField label="Price" required>
              <Input type="number" name="price" defaultValue={selectedProduct.price} required />
            </AdminField>
            <AdminField label="Quantity" required>
              <Input type="number" name="quantity" defaultValue={selectedProduct.quantity} required />
            </AdminField>
            <AdminField label="PO deadline">
              <Input type="date" name="poDeadline" defaultValue={selectedProduct.poDeadline ?? ""} />
            </AdminField>
            <AdminField label="Product link" className="md:col-span-2 xl:col-span-3">
              <Input name="productLink" defaultValue={selectedProduct.productLink ?? ""} />
            </AdminField>
            <AdminField label="Status">
              <Select name="status" defaultValue={selectedProduct.status}>
                {productStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Priority">
              <Select name="priority" defaultValue={selectedProduct.priority}>
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Purchase type">
              <Select name="purchaseType" defaultValue={selectedProduct.purchaseType}>
                {purchaseTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
              <Textarea name="notes" defaultValue={selectedProduct.notes ?? ""} />
            </AdminField>
            <div className="md:col-span-2 xl:col-span-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href={`/products/${selectedProduct.id}`} className="font-medium text-brand-700">
                  Open public detail
                </Link>
                {selectedProduct.productLink ? (
                  <a href={selectedProduct.productLink} target="_blank" rel="noreferrer" className="font-medium text-brand-700">
                    Open source link
                  </a>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link href={buildPathWithQuery("/admin/products", sharedQuery)}>Cancel</Link>
                </Button>
                <SubmitButton>Save changes</SubmitButton>
              </div>
            </div>
          </form>
        </AdminCreatePanel>
      ) : null}

      <section className="space-y-4">
        <AdminSectionHeading
          title="Products gallery"
          description={`${pagination.totalItems} item cocok dengan filter aktif. Grid menjaga image, badge, dan metadata tetap enak dipindai.`}
        />

        {pagination.totalItems ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {pagination.items.map((product) => (
                <article key={product.id} className="panel p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusStyles[product.status]}>{product.status}</Badge>
                        <Badge className={priorityStyles[product.priority]}>{product.priority}</Badge>
                      </div>
                      <Link href={`/products/${product.id}`} className="mt-3 block font-[var(--font-display)] text-2xl font-semibold leading-tight text-ink-900 transition hover:text-brand-700">
                        {product.name}
                      </Link>
                      <p className="mt-2 text-sm text-ink-500">{product.event.name} - {product.circle.name}</p>
                    </div>
                    <AdminActionDropdown>
                      <AdminActionLink href={buildPathWithQuery("/admin/products", { ...sharedQuery, edit: product.id })}>
                        Edit
                      </AdminActionLink>
                      {product.productLink ? (
                        <AdminActionLink href={product.productLink}>Open source link</AdminActionLink>
                      ) : null}
                      <AdminActionLink href={`/products/${product.id}`}>Open public detail</AdminActionLink>
                      <AdminActionDivider />
                      <AdminActionLabel>Quick status</AdminActionLabel>
                      <form action={quickUpdateProductStatusAction} className="space-y-2 px-2 pb-2 pt-1">
                        <input type="hidden" name="productId" value={product.id} />
                        <Select name="status" defaultValue={product.status} className="h-10 rounded-xl text-sm">
                          {productStatuses.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </Select>
                        <Button type="submit" className="w-full justify-center rounded-xl">
                          Apply status
                        </Button>
                      </form>
                      <AdminActionDivider />
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <AdminActionButton type="submit" destructive>
                          Delete
                        </AdminActionButton>
                      </form>
                    </AdminActionDropdown>
                  </div>

                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="mt-4 aspect-[4/3]"
                    fallbackLabel="No Image"
                    fallbackDescription="Tambahkan direct image URL untuk thumbnail produk."
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Price</p>
                      <p className="mt-1 font-semibold text-ink-900">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Qty / Type</p>
                      <p className="mt-1 font-semibold text-ink-900">{product.quantity} x {formatEnumLabel(product.purchaseType)}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Deadline</p>
                      <p className="mt-1 font-semibold text-ink-900">{formatDate(product.poDeadline)}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Source</p>
                      <p className="mt-1 truncate font-medium text-brand-700">{compactUrl(product.productLink, 24)}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-line bg-white/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Notes</p>
                    <p className="mt-2 text-sm leading-6 text-ink-600" style={notesClampStyle}>
                      {product.notes || "No additional notes."}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <AdminPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              pathname="/admin/products"
              query={baseQuery}
            />
          </>
        ) : (
          <EmptyState title="Produk tidak ditemukan" description="Coba ubah pencarian atau filter yang sedang aktif." />
        )}
      </section>
    </AdminShell>
  );
}