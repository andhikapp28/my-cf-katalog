"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenseCategories, expenses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { expenseCategorySchema, expenseSchema } from "@/lib/validators";

export async function upsertExpenseCategoryAction(formData: FormData) {
  await requireAdmin();

  const parsed = expenseCategorySchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    color: formData.get("color") || "#D46A3A"
  });

  if (parsed.id) {
    await db
      .update(expenseCategories)
      .set({
        name: parsed.name,
        slug: parsed.slug,
        color: parsed.color,
        updatedAt: new Date()
      })
      .where(eq(expenseCategories.id, parsed.id));
  } else {
    await db.insert(expenseCategories).values(parsed);
  }

  revalidatePath("/expenses");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/expenses/settings");
  redirect("/admin/expenses/settings?success=category-saved");
}

export async function deleteExpenseCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
  revalidatePath("/expenses");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/expenses/settings");
  redirect("/admin/expenses/settings?success=category-deleted");
}

export async function upsertExpenseAction(formData: FormData) {
  await requireAdmin();

  const parsed = expenseSchema.parse({
    id: formData.get("id") || undefined,
    eventId: formData.get("eventId"),
    productId: formData.get("productId") || undefined,
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    note: formData.get("note") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    isPlanned: formData.get("isPlanned") === "on",
    isActual: formData.get("isActual") === "on"
  });

  const values = {
    eventId: parsed.eventId,
    productId: parsed.productId || null,
    categoryId: parsed.categoryId,
    amount: parsed.amount,
    expenseDate: parsed.expenseDate,
    note: parsed.note,
    paymentMethod: parsed.paymentMethod,
    isPlanned: parsed.isPlanned,
    isActual: parsed.isActual
  };

  if (parsed.id) {
    await db.update(expenses).set({ ...values, updatedAt: new Date() }).where(eq(expenses.id, parsed.id));
  } else {
    await db.insert(expenses).values(values);
  }

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/admin");
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses?success=expense-saved");
}

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/admin");
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses?success=expense-deleted");
}