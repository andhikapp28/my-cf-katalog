export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteProductAction, quickUpdateProductStatusAction, upsertProductAction } from "@/actions/products";
import { AdminShell } from "@/components/layout/admin-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { ImageFileInput } from "@/components/forms/image-file-input";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAdminProductsForEvent, getCircleList, getEventList } from "@/db/queries";

export default async function AdminProductsPage() {
  const [events, circles, products] = await Promise.all([getEventList(), getCircleList(), getAdminProductsForEvent()]);

  return (
    <AdminShell title="Products" description="Kelola target item, upload gambar ke Blob, update status cepat, dan simpan metadata produk yang relevan untuk hari event.">
      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <section className="panel p-5">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">Add product</h2>
          <form action={upsertProductAction} className="mt-5 space-y-4">
            <Select name="eventId" required><option value="">Select event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</Select>
            <Select name="circleId" required><option value="">Select circle</option>{circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}</Select>
            <Input name="name" placeholder="Summer Illustration Book" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="number" name="price" placeholder="185000" required />
              <Input type="number" name="quantity" placeholder="1" defaultValue={1} required />
            </div>
            <Input type="date" name="poDeadline" />
            <Input name="productLink" placeholder="https://instagram.com/..." />
            <div className="grid gap-3 sm:grid-cols-3">
              <Select name="status" defaultValue="TARGET"><option value="TARGET">TARGET</option><option value="PO_OPEN">PO_OPEN</option><option value="PO_DONE">PO_DONE</option><option value="PURCHASED">PURCHASED</option><option value="CANCELLED">CANCELLED</option><option value="SOLD_OUT">SOLD_OUT</option></Select>
              <Select name="priority" defaultValue="MEDIUM"><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></Select>
              <Select name="purchaseType" defaultValue="ON_THE_SPOT"><option value="PO">PO</option><option value="ON_THE_SPOT">ON_THE_SPOT</option></Select>
            </div>
            <Textarea name="notes" placeholder="Catatan produk, reminder pembayaran, atau bundle info." />
            <ImageFileInput name="image" label="Product image" />
            <SubmitButton>Save product</SubmitButton>
          </form>
        </section>

        <section className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{product.event.name} â€¢ {product.circle.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={quickUpdateProductStatusAction} className="flex gap-2">
                    <input type="hidden" name="productId" value={product.id} />
                    <Select name="status" defaultValue={product.status} className="min-w-[160px]"><option value="TARGET">TARGET</option><option value="PO_OPEN">PO_OPEN</option><option value="PO_DONE">PO_DONE</option><option value="PURCHASED">PURCHASED</option><option value="CANCELLED">CANCELLED</option><option value="SOLD_OUT">SOLD_OUT</option></Select>
                    <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">Quick update</button>
                  </form>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                  </form>
                </div>
              </div>
              <form action={upsertProductAction} className="mt-5 space-y-4">
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="previousImageUrl" value={product.imageUrl ?? ""} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Select name="eventId" defaultValue={product.eventId} required>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</Select>
                  <Select name="circleId" defaultValue={product.circleId} required>{circles.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}</Select>
                  <div className="md:col-span-2"><Input name="name" defaultValue={product.name} required /></div>
                  <Input type="number" name="price" defaultValue={product.price} required />
                  <Input type="number" name="quantity" defaultValue={product.quantity} required />
                  <Input type="date" name="poDeadline" defaultValue={product.poDeadline ?? ""} />
                  <Input name="productLink" defaultValue={product.productLink ?? ""} />
                  <Select name="status" defaultValue={product.status}><option value="TARGET">TARGET</option><option value="PO_OPEN">PO_OPEN</option><option value="PO_DONE">PO_DONE</option><option value="PURCHASED">PURCHASED</option><option value="CANCELLED">CANCELLED</option><option value="SOLD_OUT">SOLD_OUT</option></Select>
                  <Select name="priority" defaultValue={product.priority}><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></Select>
                  <Select name="purchaseType" defaultValue={product.purchaseType}><option value="PO">PO</option><option value="ON_THE_SPOT">ON_THE_SPOT</option></Select>
                  <div className="md:col-span-2"><Textarea name="notes" defaultValue={product.notes ?? ""} /></div>
                </div>
                <ImageFileInput name="image" label="Replace product image" defaultUrl={product.imageUrl} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Link href={`/products/${product.id}`} className="font-medium text-brand-700">Open public detail</Link>
                    {product.imageUrl ? <span className="text-ink-500">Upload image baru untuk replace gambar saat ini.</span> : null}
                  </div>
                  <SubmitButton>Save changes</SubmitButton>
                </div>
              </form>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}


