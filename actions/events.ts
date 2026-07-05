"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeParseFormData } from "@/lib/form";
import { eventSchema } from "@/lib/validators";

export type EventFormState = {
  success?: string;
  error?: string;
};

export async function upsertEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parseResult = safeParseFormData(eventSchema, {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    venue: formData.get("venue") || undefined,
    bannerImageUrl: formData.get("bannerImageUrl") || undefined,
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
    budget: formData.get("budget"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;

  if (parsed.isActive) {
    await db.update(events).set({ isActive: false, updatedAt: new Date() });
  }

  if (parsed.id) {
    await db
      .update(events)
      .set({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        venue: parsed.venue,
        bannerImageUrl: parsed.bannerImageUrl || null,
        startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
        endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
        budget: parsed.budget,
        isActive: parsed.isActive,
        updatedAt: new Date()
      })
      .where(eq(events.id, parsed.id));
  } else {
    await db.insert(events).values({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      venue: parsed.venue,
      bannerImageUrl: parsed.bannerImageUrl || null,
      startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
      endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
      budget: parsed.budget,
      isActive: parsed.isActive
    });
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  return { success: parsed.id ? "Event berhasil disimpan." : "Event baru berhasil dibuat." };
}

export async function deleteEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  return { success: "Event dihapus." };
}
