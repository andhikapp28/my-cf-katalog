"use client";

import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addCatalogEntryAction } from "@/actions/catalog";
import { AdminField } from "@/components/admin/admin-field";
import { CircleCombobox, type CircleValue } from "@/components/admin/circle-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { priorities, productStatuses, purchaseTypes } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

type EventOption = { id: string; name: string; isActive: boolean };
type FloorMapOption = { id: string; name: string; eventId: string };
type CircleOption = { id: string; name: string };

type ProductRow = {
  name: string;
  imageUrl: string;
  price: string;
  poDeadline: string;
  productLink: string;
  status: string;
  priority: string;
  quantity: string;
  notes: string;
  purchaseType: string;
};

function createRow(): ProductRow {
  return {
    name: "",
    imageUrl: "",
    price: "",
    poDeadline: "",
    productLink: "",
    status: "TARGET",
    priority: "MEDIUM",
    quantity: "1",
    notes: "",
    purchaseType: "ON_THE_SPOT"
  };
}

const enumLabel = (value: string) => value.replace(/_/g, " ");

export function CatalogEntryForm({
  events,
  circles,
  floorMaps
}: {
  events: EventOption[];
  circles: CircleOption[];
  floorMaps: FloorMapOption[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addCatalogEntryAction, {} as { error?: string; success?: string });

  const defaultEventId = events.find((event) => event.isActive)?.id ?? events[0]?.id ?? "";
  const [eventId, setEventId] = useState(defaultEventId);
  const [circle, setCircle] = useState<CircleValue | null>(null);
  const [boothEnabled, setBoothEnabled] = useState(false);
  const [booth, setBooth] = useState({ floorMapId: "", boothCode: "", posX: "", posY: "", notes: "" });
  const [rows, setRows] = useState<ProductRow[]>([createRow()]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  /**
   * `addCatalogEntryAction` (actions/catalog.ts) SENGAJA TIDAK memanggil
   * `redirect()` lagi (lihat komentar panjang di actions/products.ts untuk
   * root cause). Navigasi pasca-sukses ke /admin/products dilakukan di sini
   * lewat `router.push()` client-side murni, yang sudah diverifikasi aman di
   * build produksi sungguhan secara terpisah (lihat actions/auth.ts). Form
   * juga di-reset supaya user bisa langsung menambah entri katalog berikutnya
   * kalau navigasi belum sempat terjadi / dibatalkan oleh browser back button.
   */
  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      setJustSaved(true);
      setCircle(null);
      setBoothEnabled(false);
      setBooth({ floorMapId: "", boothCode: "", posX: "", posY: "", notes: "" });
      setRows([createRow()]);
      setClientError(null);
      router.push("/admin/products");
      router.refresh();
    }
  }, [state, router]);

  const eventMaps = useMemo(
    () => floorMaps.filter((map) => map.eventId === eventId),
    [floorMaps, eventId]
  );
  const total = rows.reduce(
    (sum, row) => sum + (Number(row.price) || 0) * (Number(row.quantity) || 0),
    0
  );

  function updateRow(index: number, patch: Partial<ProductRow>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function handleEventChange(nextEventId: string) {
    setEventId(nextEventId);
    setBooth((current) => ({
      ...current,
      floorMapId: floorMaps.some((map) => map.id === current.floorMapId && map.eventId === nextEventId)
        ? current.floorMapId
        : ""
    }));
  }

  function validate(): string | null {
    if (!eventId) return "Pilih event dulu.";
    if (!circle) return "Pilih atau buat circle dulu.";
    if (circle.mode === "new" && circle.name.trim().length < 2) {
      return "Nama circle baru minimal 2 karakter.";
    }
    if (boothEnabled) {
      if (!booth.floorMapId) return "Pilih floor map untuk booth, atau matikan bagian booth.";
      if (!booth.boothCode.trim()) return "Isi booth code, atau matikan bagian booth.";
      const x = Number(booth.posX);
      const y = Number(booth.posY);
      if (!Number.isFinite(x) || x < 0 || x > 100 || !Number.isFinite(y) || y < 0 || y > 100) {
        return "Marker X/Y harus angka 0–100.";
      }
    }
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].name.trim().length < 2) return `Produk #${i + 1}: nama minimal 2 karakter.`;
      if ((Number(rows[i].price) || 0) < 0) return `Produk #${i + 1}: harga tidak valid.`;
    }
    return null;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const error = validate();
    setClientError(error);
    if (error) return;

    const selected = circle!;
    const circlePayload =
      selected.mode === "existing"
        ? { mode: "existing" as const, id: selected.id }
        : {
            mode: "new" as const,
            name: selected.name.trim(),
            socialLink: selected.socialLink || undefined,
            notes: selected.notes || undefined
          };

    const payload = {
      eventId,
      circle: circlePayload,
      booth: boothEnabled
        ? {
            floorMapId: booth.floorMapId,
            boothCode: booth.boothCode.trim(),
            posX: Number(booth.posX),
            posY: Number(booth.posY),
            notes: booth.notes || undefined
          }
        : undefined,
      products: rows.map((row) => ({
        name: row.name.trim(),
        imageUrl: row.imageUrl.trim() || undefined,
        price: Number(row.price) || 0,
        poDeadline: row.poDeadline || undefined,
        productLink: row.productLink.trim() || undefined,
        status: row.status,
        priority: row.priority,
        quantity: Number(row.quantity) || 1,
        notes: row.notes.trim() || undefined,
        purchaseType: row.purchaseType
      }))
    };

    const formData = new FormData();
    formData.set("payload", JSON.stringify(payload));
    startTransition(() => formAction(formData));
  }

  const message = clientError ?? state.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      {/* 1 · Event */}
      <section className="panel space-y-4 p-6">
        <SectionHeading step="1" title="Event" description="Semua produk & booth di form ini akan tercatat untuk event yang dipilih." />
        <AdminField label="Event" required>
          <Select value={eventId} onChange={(event) => handleEventChange(event.target.value)} required>
            {events.length === 0 ? <option value="">Belum ada event</option> : null}
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
                {event.isActive ? " (aktif)" : ""}
              </option>
            ))}
          </Select>
        </AdminField>
      </section>

      {/* 2 · Circle */}
      <section className="panel space-y-4 p-6">
        <SectionHeading step="2" title="Circle" description="Pilih circle yang sudah ada, atau ketik nama baru untuk membuatnya langsung." />
        <CircleCombobox circles={circles} value={circle} onChange={setCircle} />
      </section>

      {/* 3 · Booth (opsional) */}
      <section className="panel space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <SectionHeading step="3" title="Lokasi booth" description="Opsional — lewati kalau boothnya belum diketahui." />
          <label className="flex shrink-0 items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={boothEnabled}
              onChange={(event) => setBoothEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500/40"
            />
            Set booth
          </label>
        </div>

        {boothEnabled ? (
          eventMaps.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-500">
              Event ini belum punya floor map. Tambahkan dulu di menu Floor Maps, atau matikan bagian booth.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AdminField label="Floor map" required>
                <Select
                  value={booth.floorMapId}
                  onChange={(event) => setBooth((current) => ({ ...current, floorMapId: event.target.value }))}
                >
                  <option value="">Pilih floor map</option>
                  {eventMaps.map((map) => (
                    <option key={map.id} value={map.id}>
                      {map.name}
                    </option>
                  ))}
                </Select>
              </AdminField>
              <AdminField label="Booth code" required>
                <Input
                  value={booth.boothCode}
                  placeholder="A-12"
                  onChange={(event) => setBooth((current) => ({ ...current, boothCode: event.target.value }))}
                />
              </AdminField>
              <AdminField label="Marker X" hint="0-100%">
                <Input
                  type="number"
                  value={booth.posX}
                  placeholder="28"
                  onChange={(event) => setBooth((current) => ({ ...current, posX: event.target.value }))}
                />
              </AdminField>
              <AdminField label="Marker Y" hint="0-100%">
                <Input
                  type="number"
                  value={booth.posY}
                  placeholder="44"
                  onChange={(event) => setBooth((current) => ({ ...current, posY: event.target.value }))}
                />
              </AdminField>
              <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
                <Textarea
                  value={booth.notes}
                  placeholder="Catatan booth (opsional)…"
                  onChange={(event) => setBooth((current) => ({ ...current, notes: event.target.value }))}
                />
              </AdminField>
            </div>
          )
        ) : null}
      </section>

      {/* 4 · Produk */}
      <section className="panel space-y-4 p-6">
        <SectionHeading step="4" title="Produk target" description="Tambahkan satu atau beberapa incaran untuk circle ini." />

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="rounded-3xl border border-line bg-white/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-800">Produk #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => setRows((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current))}
                  disabled={rows.length === 1}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 transition hover:text-rose-700 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AdminField label="Nama" required className="md:col-span-2 xl:col-span-3">
                  <Input
                    value={row.name}
                    placeholder="Summer Illustration Book"
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Harga" required hint="Rupiah">
                  <Input
                    type="number"
                    value={row.price}
                    placeholder="185000"
                    onChange={(event) => updateRow(index, { price: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Qty">
                  <Input
                    type="number"
                    value={row.quantity}
                    min={1}
                    onChange={(event) => updateRow(index, { quantity: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Priority">
                  <Select value={row.priority} onChange={(event) => updateRow(index, { priority: event.target.value })}>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Select>
                </AdminField>
                <AdminField label="Status">
                  <Select value={row.status} onChange={(event) => updateRow(index, { status: event.target.value })}>
                    {productStatuses.map((status) => (
                      <option key={status} value={status}>
                        {enumLabel(status)}
                      </option>
                    ))}
                  </Select>
                </AdminField>
                <AdminField label="Purchase type">
                  <Select value={row.purchaseType} onChange={(event) => updateRow(index, { purchaseType: event.target.value })}>
                    {purchaseTypes.map((type) => (
                      <option key={type} value={type}>
                        {enumLabel(type)}
                      </option>
                    ))}
                  </Select>
                </AdminField>
                {row.purchaseType === "PO" ? (
                  <AdminField label="PO deadline">
                    <Input
                      type="date"
                      value={row.poDeadline}
                      onChange={(event) => updateRow(index, { poDeadline: event.target.value })}
                    />
                  </AdminField>
                ) : null}
                <AdminField label="Image URL" className="md:col-span-2 xl:col-span-3">
                  <Input
                    type="url"
                    value={row.imageUrl}
                    placeholder="https://cdn.example.com/product.jpg"
                    onChange={(event) => updateRow(index, { imageUrl: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Product link" className="md:col-span-2 xl:col-span-3">
                  <Input
                    type="url"
                    value={row.productLink}
                    placeholder="https://…"
                    onChange={(event) => updateRow(index, { productLink: event.target.value })}
                  />
                </AdminField>
                <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
                  <Textarea
                    value={row.notes}
                    placeholder="Catatan produk (opsional)…"
                    onChange={(event) => updateRow(index, { notes: event.target.value })}
                  />
                </AdminField>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, createRow()])}>
          <Plus className="mr-1 h-4 w-4" /> Tambah produk lain
        </Button>
      </section>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
        <div className="container-shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-ink-700">
            <span className="font-semibold text-ink-900">{rows.length} produk</span>
            <span className="mx-2 text-ink-400">·</span>
            <span>Total estimasi {formatCurrency(total)}</span>
            {message ? <span className="ml-3 text-rose-600">{message}</span> : null}
            {justSaved ? (
              <span className="ml-3 text-emerald-600">
                Tersimpan.{" "}
                <Link href="/admin/products" className="underline">
                  Lihat di Products
                </Link>
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href="/admin/products">Batal</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan ke katalog"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function SectionHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
        {step}
      </span>
      <div>
        <h2 className="font-[var(--font-display)] text-xl font-semibold text-ink-900">{title}</h2>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
    </div>
  );
}
