"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenseCategories, expenses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { safeParseFormData } from "@/lib/form";
import { expenseCategorySchema, expenseSchema } from "@/lib/validators";

export type ExpenseFormState = {
  success?: string;
  error?: string;
};

export async function upsertExpenseCategoryAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  await requireAdmin();

  const parseResult = safeParseFormData(expenseCategorySchema, {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    color: formData.get("color") || "#D46A3A"
  });

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;

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

  return { success: parsed.id ? "Kategori expense disimpan." : "Kategori expense baru berhasil dibuat." };
}

export async function deleteExpenseCategoryAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
  revalidatePath("/expenses");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/expenses/settings");

  return { success: "Kategori expense dihapus." };
}

export async function upsertExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  await requireAdmin();

  const parseResult = safeParseFormData(expenseSchema, {
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

  if (!parseResult.success) {
    return { error: parseResult.error };
  }

  const parsed = parseResult.data;

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

  return { success: parsed.id ? "Expense berhasil disimpan." : "Expense baru berhasil dicatat." };
}

export async function deleteExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/admin");
  revalidatePath("/admin/expenses");

  return { success: "Expense dihapus." };
}
