"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { boothLocations, floorMaps } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeDeleteBlob, uploadImageToBlob } from "@/lib/blob";
import { safeParseFormData } from "@/lib/form";
import { boothLocationSchema, floorMapSchema } from "@/lib/validators";

export type FloorMapFormState = {
  success?: string;
  error?: string;
};

export async function upsertFloorMapAction(
  _prevState: FloorMapFormState,
  formData: FormData
): Promise<FloorMapFormState> {
  await requireAdmin();

  const parseResult = safeParseFormData(floorMapSchema, {
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    hall: formData.get("hall") || undefined,
    width: formData.get("width"),
    height: formData.get("height"),
    previousImageUrl: formData.get("previousImageUrl") || undefined
  });

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;

  const image = formData.get("image");
  let imageUrl = parsed.previousImageUrl || null;

  if (image instanceof File && image.size > 0) {
    imageUrl = await uploadImageToBlob(image, "maps", parsed.previousImageUrl || null);
  }

  if (!imageUrl) {
    return { error: "Floor map wajib memiliki gambar." };
  }

  if (parsed.id) {
    await db
      .update(floorMaps)
      .set({
        eventId: parsed.eventId,
        name: parsed.name,
        hall: parsed.hall || null,
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
      hall: parsed.hall || null,
      width: parsed.width,
      height: parsed.height,
      imageUrl
    });
  }

  revalidatePath("/maps");
  revalidatePath("/admin/floor-maps");

  return { success: parsed.id ? "Floor map berhasil disimpan." : "Floor map baru berhasil diunggah." };
}

export async function deleteFloorMapAction(
  _prevState: FloorMapFormState,
  formData: FormData
): Promise<FloorMapFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  await db.delete(floorMaps).where(eq(floorMaps.id, id));
  await safeDeleteBlob(imageUrl);
  revalidatePath("/maps");
  revalidatePath("/admin/floor-maps");

  return { success: "Floor map dihapus." };
}

export async function upsertBoothAction(
  _prevState: FloorMapFormState,
  formData: FormData
): Promise<FloorMapFormState> {
  await requireAdmin();

  const parseResult = safeParseFormData(boothLocationSchema, {
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    circleId: formData.get("circleId"),
    floorMapId: formData.get("floorMapId"),
    boothCode: formData.get("boothCode"),
    day: formData.get("day") || "ALL_DAYS",
    posX: formData.get("posX"),
    posY: formData.get("posY"),
    notes: formData.get("notes") || undefined
  });

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;

  if (parsed.id) {
    await db
      .update(boothLocations)
      .set({
        eventId: parsed.eventId,
        circleId: parsed.circleId,
        floorMapId: parsed.floorMapId,
        boothCode: parsed.boothCode,
        day: parsed.day,
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
  revalidatePath("/admin/checklist");

  return { success: parsed.id ? "Booth berhasil disimpan." : "Booth marker baru berhasil ditambahkan." };
}

export async function deleteBoothAction(
  _prevState: FloorMapFormState,
  formData: FormData
): Promise<FloorMapFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(boothLocations).where(eq(boothLocations.id, id));
  revalidatePath("/maps");
  revalidatePath("/products");
  revalidatePath("/admin/booths");

  return { success: "Booth dihapus." };
}
