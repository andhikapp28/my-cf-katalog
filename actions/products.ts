"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productStatusLogs, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeParseFormData } from "@/lib/form";
import { productSchema, quickStatusSchema } from "@/lib/validators";

export type ProductFormState = {
  success?: string;
  error?: string;
};

export async function upsertProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await requireAdmin();

  const parseResult = safeParseFormData(productSchema, {
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    circleId: formData.get("circleId"),
    name: formData.get("name"),
    imageUrl: formData.get("imageUrl") || undefined,
    price: formData.get("price"),
    poDeadline: formData.get("poDeadline") || undefined,
    productLink: formData.get("productLink") || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    targetDay: formData.get("targetDay") || "ALL_DAYS",
    isRush: formData.get("isRush") === "true" || formData.get("isRush") === "on",
    poPickupNotes: formData.get("poPickupNotes") || undefined,
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
    purchaseType: formData.get("purchaseType")
  });

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;
  const imageUrl = parsed.imageUrl || null;

  if (parsed.id) {
    const previous = await db.query.products.findFirst({
      where: eq(products.id, parsed.id)
    });

    await db
      .update(products)
      .set({
        eventId: parsed.eventId,
        circleId: parsed.circleId,
        name: parsed.name,
        imageUrl,
        price: parsed.price,
        poDeadline: parsed.poDeadline || null,
        productLink: parsed.productLink || null,
        status: parsed.status,
        priority: parsed.priority,
        targetDay: parsed.targetDay,
        isRush: parsed.isRush,
        poPickupNotes: parsed.poPickupNotes || null,
        quantity: parsed.quantity,
        notes: parsed.notes,
        purchaseType: parsed.purchaseType,
        updatedAt: new Date()
      })
      .where(eq(products.id, parsed.id));

    if (previous && previous.status !== parsed.status) {
      await db.insert(productStatusLogs).values({
        productId: previous.id,
        fromStatus: previous.status,
        toStatus: parsed.status,
        createdBy: session.user.id
      });
    }
  } else {
    const [created] = await db
      .insert(products)
      .values({
        eventId: parsed.eventId,
        circleId: parsed.circleId,
        name: parsed.name,
        imageUrl,
        price: parsed.price,
        poDeadline: parsed.poDeadline || null,
        productLink: parsed.productLink || null,
        status: parsed.status,
        priority: parsed.priority,
        targetDay: parsed.targetDay,
        isRush: parsed.isRush,
        poPickupNotes: parsed.poPickupNotes || null,
        quantity: parsed.quantity,
        notes: parsed.notes,
        purchaseType: parsed.purchaseType
      })
      .returning();

    await db.insert(productStatusLogs).values({
      productId: created.id,
      toStatus: parsed.status,
      createdBy: session.user.id
    });
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/checklist");

  return { success: parsed.id ? "Produk berhasil disimpan." : "Produk baru berhasil ditambahkan." };
}

export type QuickStatusState = {
  success?: string;
  error?: string;
};

/**
 * Update status produk cepat (dipakai dropdown quick-status di /admin/products
 * DAN mode checklist di /admin/checklist).
 *
 * SENGAJA TIDAK memakai redirect() pasca mutasi. Root cause & cakupan bug ini
 * (FINAL, hasil re-verifikasi langsung di build produksi sungguhan next build
 * && next start, next 15.5.20 + next-auth 5.0.0-beta.31 — versi yang memang
 * terpasang di package.json project ini):
 *
 * SETIAP Server Action yang memanggil `redirect()` next/navigation (baik
 * manual, MAUPUN internal lewat next-auth `signIn()`/`signOut()` ketika opsi
 * `redirect` tidak di-set `false`) membuat client Next.js macet PERMANEN
 * menunggu navigasi yang tidak pernah ter-apply, walau server SUDAH sukses
 * memproses mutasi. Ini dibuktikan berlaku untuk:
 *   - Redirect ke pathname yang SAMA (mis. /admin/products -> /admin/products
 *     ?success=product-saved): response diterima server <1 detik, tapi
 *     `page.url()` browser tidak berubah bahkan setelah 40+ detik, PADAHAL
 *     baris di DB sudah ter-insert/ter-update (diverifikasi query DB langsung
 *     saat client masih macet).
 *   - Redirect ke pathname BERBEDA, termasuk login (/admin/login -> /admin
 *     lewat `signIn("credentials", { redirectTo: "/admin" })`): client macet
 *     >40 detik di /admin/login, TAPI cookie sesi (`authjs.session-token`)
 *     sudah ter-set dengan benar dan `page.goto("/admin")` manual di context
 *     yang sama langsung berhasil menampilkan Admin Dashboard tanpa reload
 *     login. Ini MEMBANTAH klaim versi sebelumnya (pernah tercatat di
 *     playwright.config.ts) bahwa redirect login "tidak kena bug ini" — klaim
 *     itu sudah tidak valid untuk versi next-auth yang terpasang sekarang
 *     (beta.31; klaim lama diuji di beta.30) dan sudah diperbaiki di kedua
 *     tempat.
 *
 * Kesimpulan: bug ini bukan soal "pathname sama vs beda", tapi soal
 * `redirect()` itu sendiri (apa pun sumbernya) yang dipanggil dari dalam
 * Server Action. Pin ke Next 15.1.6 + next-auth beta.25 terbukti
 * menghilangkan bug ini, TAPI 15.1.6 punya CVE kritis (CVE-2025-66478)
 * sehingga tidak dipakai sebagai fix.
 *
 * Solusi arsitektural yang dipilih (dipakai KONSISTEN di seluruh action
 * `actions/*.ts` di project ini, termasuk `authenticate()`/`logoutAction()` di
 * actions/auth.ts): action mengembalikan state `{success|error}` lewat pola
 * `useActionState`, TIDAK PERNAH memanggil `redirect()` (untuk next-auth,
 * ini berarti memanggil `signIn()`/`signOut()` dengan `redirect: false`).
 * Caller (client component) menampilkan toast dari state tsb, dan memakai
 * `router.refresh()` (BUKAN Server Action redirect) untuk me-refresh data
 * Server Component — mekanisme ini terverifikasi aman karena tidak melewati
 * jalur redirect Server Action yang bermasalah. Untuk kasus yang benar-benar
 * butuh pindah halaman (login, logout), dipakai `router.push()` client-side
 * murni (next/navigation, dipanggil dari client component biasa, BUKAN
 * dikembalikan dari Server Action) — ini SUDAH diverifikasi aman secara
 * terpisah di build produksi yang sama (lihat komentar di actions/auth.ts).
 */
export async function quickUpdateProductStatusAction(
  _prevState: QuickStatusState,
  formData: FormData
): Promise<QuickStatusState> {
  const session = await requireAdmin();

  const parsed = quickStatusSchema.safeParse({
    productId: formData.get("productId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { error: "Status produk tidak valid." };
  }

  const { productId, status: nextStatus } = parsed.data;

  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId)
  });

  if (!existing) {
    return { error: "Produk tidak ditemukan." };
  }

  await db
    .update(products)
    .set({
      status: nextStatus,
      updatedAt: new Date()
    })
    .where(eq(products.id, productId));

  await db.insert(productStatusLogs).values({
    productId,
    fromStatus: existing.status,
    toStatus: nextStatus,
    createdBy: session.user.id
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/admin/checklist");

  return { success: "Status produk diperbarui." };
}

export async function deleteProductImageAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  await db.update(products).set({ imageUrl: null, updatedAt: new Date() }).where(eq(products.id, productId));
  revalidatePath("/products");
  revalidatePath("/admin/products");

  return { success: "Gambar produk dihapus." };
}

export async function deleteProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return { success: "Produk dihapus." };
}