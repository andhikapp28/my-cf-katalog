"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { circles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { circleSchema } from "@/lib/validators";

export async function upsertCircleAction(formData: FormData) {
  await requireAdmin();

  const parsed = circleSchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    socialLink: formData.get("socialLink") || undefined,
    notes: formData.get("notes") || undefined
  });

  if (parsed.id) {
    await db
      .update(circles)
      .set({
        name: parsed.name,
        slug: parsed.slug,
        socialLink: parsed.socialLink || null,
        notes: parsed.notes,
        updatedAt: new Date()
      })
      .where(eq(circles.id, parsed.id));
  } else {
    await db.insert(circles).values({
      name: parsed.name,
      slug: parsed.slug,
      socialLink: parsed.socialLink || null,
      notes: parsed.notes
    });
  }

  revalidatePath("/circles");
  revalidatePath("/products");
  revalidatePath("/admin/circles");
  redirect("/admin/circles?success=circle-saved");
}

export async function deleteCircleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(circles).where(eq(circles.id, id));
  revalidatePath("/circles");
  revalidatePath("/products");
  revalidatePath("/admin/circles");
  redirect("/admin/circles?success=circle-deleted");
}


