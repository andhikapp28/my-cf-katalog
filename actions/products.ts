"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productStatusLogs, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeDeleteBlob, uploadImageToBlob } from "@/lib/blob";
import { productSchema } from "@/lib/validators";

export async function upsertProductAction(formData: FormData) {
  const session = await requireAdmin();

  const parsed = productSchema.parse({
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    circleId: formData.get("circleId"),
    name: formData.get("name"),
    price: formData.get("price"),
    poDeadline: formData.get("poDeadline") || undefined,
    productLink: formData.get("productLink") || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
    purchaseType: formData.get("purchaseType"),
    previousImageUrl: formData.get("previousImageUrl") || undefined
  });

  const image = formData.get("image");
  let imageUrl = parsed.previousImageUrl || null;

  if (image instanceof File && image.size > 0) {
    imageUrl = await uploadImageToBlob(image, "products", parsed.previousImageUrl || null);
  }

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
        price: parsed.price,
        poDeadline: parsed.poDeadline || null,
        productLink: parsed.productLink || null,
        status: parsed.status,
        priority: parsed.priority,
        quantity: parsed.quantity,
        notes: parsed.notes,
        purchaseType: parsed.purchaseType,
        imageUrl,
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
        price: parsed.price,
        poDeadline: parsed.poDeadline || null,
        productLink: parsed.productLink || null,
        status: parsed.status,
        priority: parsed.priority,
        quantity: parsed.quantity,
        notes: parsed.notes,
        purchaseType: parsed.purchaseType,
        imageUrl
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
  redirect("/admin/products?success=product-saved");
}

export async function quickUpdateProductStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const nextStatus = String(formData.get("status") ?? "");

  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId)
  });

  if (!existing) {
    redirect("/admin/products?error=product-not-found");
  }

  await db
    .update(products)
    .set({
      status: nextStatus as typeof existing.status,
      updatedAt: new Date()
    })
    .where(eq(products.id, productId));

  await db.insert(productStatusLogs).values({
    productId,
    fromStatus: existing.status,
    toStatus: nextStatus as typeof existing.status,
    createdBy: session.user.id
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?success=status-updated");
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  await db.update(products).set({ imageUrl: null, updatedAt: new Date() }).where(eq(products.id, productId));
  await safeDeleteBlob(imageUrl);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?success=image-removed");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await db.query.products.findFirst({ where: eq(products.id, id) });
  await db.delete(products).where(eq(products.id, id));
  await safeDeleteBlob(existing?.imageUrl);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?success=product-deleted");
}


