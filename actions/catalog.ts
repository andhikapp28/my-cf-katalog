"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { boothLocations, circles, floorMaps, productStatusLogs, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { catalogEntrySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

type CatalogFormState = { error?: string };

/**
 * Menambahkan satu entri katalog (circle + booth opsional + 1..n produk) dalam
 * SATU transaksi. Circle bisa dipilih dari yang ada atau dibuat baru (slug
 * auto-unik). Booth di-upsert lewat unique index (event, circle, boothCode)
 * sehingga aman dari double-submit. Dipakai lewat useActionState: mengembalikan
 * { error } saat gagal, dan redirect saat sukses.
 */
export async function addCatalogEntryAction(
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  const session = await requireAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Data form tidak terbaca. Muat ulang halaman lalu coba lagi." };
  }

  const parsed = catalogEntrySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue ? `Validasi gagal: ${issue.message}` : "Validasi gagal." };
  }
  const data = parsed.data;

  // Safety net: pastikan floor map memang milik event yang dipilih.
  if (data.booth) {
    const map = await db.query.floorMaps.findFirst({
      where: and(eq(floorMaps.id, data.booth.floorMapId), eq(floorMaps.eventId, data.eventId)),
      columns: { id: true }
    });
    if (!map) {
      return { error: "Floor map tidak cocok dengan event yang dipilih." };
    }
  }

  await db.transaction(async (tx) => {
    // 1. Resolve circle (pilih existing atau buat baru dengan slug unik).
    let circleId: string;
    if (data.circle.mode === "existing") {
      circleId = data.circle.id;
    } else {
      const base = slugify(data.circle.name) || "circle";
      const existing = await tx.query.circles.findMany({
        where: like(circles.slug, `${base}%`),
        columns: { slug: true }
      });
      const taken = new Set(existing.map((row) => row.slug));
      let slug = base;
      let suffix = 2;
      while (taken.has(slug)) {
        slug = `${base}-${suffix}`;
        suffix += 1;
      }
      const [created] = await tx
        .insert(circles)
        .values({
          name: data.circle.name,
          slug,
          socialLink: data.circle.socialLink || null,
          notes: data.circle.notes || null
        })
        .returning({ id: circles.id });
      circleId = created.id;
    }

    // 2. Booth (opsional, idempoten).
    if (data.booth) {
      await tx
        .insert(boothLocations)
        .values({
          eventId: data.eventId,
          circleId,
          floorMapId: data.booth.floorMapId,
          boothCode: data.booth.boothCode,
          posX: data.booth.posX,
          posY: data.booth.posY,
          notes: data.booth.notes || null
        })
        .onConflictDoUpdate({
          target: [boothLocations.eventId, boothLocations.circleId, boothLocations.boothCode],
          set: {
            floorMapId: data.booth.floorMapId,
            posX: data.booth.posX,
            posY: data.booth.posY,
            notes: data.booth.notes || null,
            updatedAt: new Date()
          }
        });
    }

    // 3. Produk 1..n + log status awal.
    for (const item of data.products) {
      const [createdProduct] = await tx
        .insert(products)
        .values({
          eventId: data.eventId,
          circleId,
          name: item.name,
          imageUrl: item.imageUrl || null,
          price: item.price,
          poDeadline: item.poDeadline || null,
          productLink: item.productLink || null,
          status: item.status,
          priority: item.priority,
          quantity: item.quantity,
          notes: item.notes || null,
          purchaseType: item.purchaseType
        })
        .returning({ id: products.id });

      await tx.insert(productStatusLogs).values({
        productId: createdProduct.id,
        toStatus: item.status,
        createdBy: session.user.id
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/circles");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/booths");
  redirect("/admin/products?success=catalog-entry-saved");
}
