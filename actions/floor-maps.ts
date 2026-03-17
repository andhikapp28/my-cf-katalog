"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { boothLocations, floorMaps } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeDeleteBlob, uploadImageToBlob } from "@/lib/blob";
import { boothLocationSchema, floorMapSchema } from "@/lib/validators";

export async function upsertFloorMapAction(formData: FormData) {
  await requireAdmin();

  const parsed = floorMapSchema.parse({
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    width: formData.get("width"),
    height: formData.get("height"),
    previousImageUrl: formData.get("previousImageUrl") || undefined
  });

  const image = formData.get("image");
  let imageUrl = parsed.previousImageUrl || null;

  if (image instanceof File && image.size > 0) {
    imageUrl = await uploadImageToBlob(image, "maps", parsed.previousImageUrl || null);
  }

  if (!imageUrl) {
    redirect("/admin/floor-maps?error=image-required");
  }

  if (parsed.id) {
    await db
      .update(floorMaps)
      .set({
        eventId: parsed.eventId,
        name: parsed.name,
        width: parsed.width,
        height: parsed.height,
        imageUrl,
        updatedAt: new Date()
      })
      .where(eq(floorMaps.id, parsed.id));
  } else {
    await db.insert(floorMaps).values({
      eventId: parsed.eventId,
      name: parsed.name,
      width: parsed.width,
      height: parsed.height,
      imageUrl
    });
  }

  revalidatePath("/maps");
  revalidatePath("/admin/floor-maps");
  redirect("/admin/floor-maps?success=floor-map-saved");
}

export async function deleteFloorMapAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  await db.delete(floorMaps).where(eq(floorMaps.id, id));
  await safeDeleteBlob(imageUrl);
  revalidatePath("/maps");
  revalidatePath("/admin/floor-maps");
  redirect("/admin/floor-maps?success=floor-map-deleted");
}

export async function upsertBoothAction(formData: FormData) {
  await requireAdmin();

  const parsed = boothLocationSchema.parse({
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    circleId: formData.get("circleId"),
    floorMapId: formData.get("floorMapId"),
    boothCode: formData.get("boothCode"),
    posX: formData.get("posX"),
    posY: formData.get("posY"),
    notes: formData.get("notes") || undefined
  });

  if (parsed.id) {
    await db
      .update(boothLocations)
      .set({
        eventId: parsed.eventId,
        circleId: parsed.circleId,
        floorMapId: parsed.floorMapId,
        boothCode: parsed.boothCode,
        posX: parsed.posX,
        posY: parsed.posY,
        notes: parsed.notes,
        updatedAt: new Date()
      })
      .where(eq(boothLocations.id, parsed.id));
  } else {
    await db.insert(boothLocations).values(parsed);
  }

  revalidatePath("/maps");
  revalidatePath("/products");
  revalidatePath("/admin/booths");
  redirect("/admin/booths?success=booth-saved");
}

export async function deleteBoothAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(boothLocations).where(eq(boothLocations.id, id));
  revalidatePath("/maps");
  revalidatePath("/products");
  revalidatePath("/admin/booths");
  redirect("/admin/booths?success=booth-deleted");
}


