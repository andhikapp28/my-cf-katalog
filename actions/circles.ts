"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { circles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeParseFormData } from "@/lib/form";
import { circleSchema } from "@/lib/validators";

export type CircleFormState = {
  success?: string;
  error?: string;
};

export async function upsertCircleAction(
  _prevState: CircleFormState,
  formData: FormData
): Promise<CircleFormState> {
  await requireAdmin();

  const parseResult = safeParseFormData(circleSchema, {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    socialLink: formData.get("socialLink") || undefined,
    notes: formData.get("notes") || undefined
  });

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;

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

  return { success: parsed.id ? "Circle berhasil disimpan." : "Circle baru berhasil dibuat." };
}

export async function deleteCircleAction(
  _prevState: CircleFormState,
  formData: FormData
): Promise<CircleFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(circles).where(eq(circles.id, id));
  revalidatePath("/circles");
  revalidatePath("/products");
  revalidatePath("/admin/circles");

  return { success: "Circle dihapus." };
}
