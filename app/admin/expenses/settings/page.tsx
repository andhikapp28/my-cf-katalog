export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteExpenseCategoryAction, upsertExpenseCategoryAction } from "@/actions/expenses";
import { AdminCreatePanel } from "@/components/admin/admin-create-panel";
import { AdminDataTable, AdminTableCell, AdminTableHead } from "@/components/admin/admin-data-table";
import { AdminField } from "@/components/admin/admin-field";
import { AdminSectionHeading } from "@/components/admin/admin-section-heading";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { getExpenseCategories } from "@/db/queries";
import { buildPathWithQuery, getSearchParam, type SearchParams } from "@/lib/admin-ui";

export default async function AdminExpenseSettingsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const editId = getSearchParam(params, "edit");
  const categories = await getExpenseCategories();

  return (
    <AdminShell
      title="Expense Category Settings"
      description="Kelola kategori expense di halaman terpisah agar workspace expense records tetap fokus dan tidak terlalu padat."
    >
      <AdminCreatePanel
        title="Add category"
        description="Tambahkan kategori baru dengan slug dan warna yang konsisten untuk summary pengeluaran."
      >
        <form action={upsertExpenseCategoryAction} className="grid gap-4 md:grid-cols-3">
          <AdminField label="Name" required>
            <Input name="name" placeholder="Merchandise" required />
          </AdminField>
          <AdminField label="Slug" required>
            <Input name="slug" placeholder="merchandise" required />
          </AdminField>
          <AdminField label="Color" required>
            <Input type="color" name="color" defaultValue="#D46A3A" className="h-11 p-2" required />
          </AdminField>
          <div className="md:col-span-3 flex justify-end">
            <SubmitButton>Save category</SubmitButton>
          </div>
        </form>
      </AdminCreatePanel>

      <section className="space-y-4">
        <AdminSectionHeading
          title="Expense categories"
          description={`${categories.length} kategori tersimpan.`}
          actions={
            <Button asChild variant="secondary">
              <Link href="/admin/expenses">Back to expenses</Link>
            </Button>
          }
        />

        {categories.length ? (
          <AdminDataTable>
            <thead>
              <tr>
                <AdminTableHead>Name</AdminTableHead>
                <AdminTableHead>Slug</AdminTableHead>
                <AdminTableHead>Color</AdminTableHead>
                <AdminTableHead className="w-[220px]">Actions</AdminTableHead>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const isEditing = editId === category.id;

                return [
                  <tr key={category.id} className="bg-white/80 hover:bg-brand-50/40">
                    <AdminTableCell className="min-w-[220px] font-medium text-ink-900">{category.name}</AdminTableCell>
                    <AdminTableCell className="min-w-[180px] text-ink-500">{category.slug}</AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-16 rounded-xl border border-line" style={{ backgroundColor: category.color }} />
                        <span className="text-sm text-ink-500">{category.color}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="secondary">
                          <Link href={isEditing ? "/admin/expenses/settings" : buildPathWithQuery("/admin/expenses/settings", { edit: category.id })}>
                            {isEditing ? "Close" : "Edit"}
                          </Link>
                        </Button>
                        <form action={deleteExpenseCategoryAction}>
                          <input type="hidden" name="id" value={category.id} />
                          <ConfirmDeleteButton />
                        </form>
                      </div>
                    </AdminTableCell>
                  </tr>,
                  isEditing ? (
                    <tr key={`${category.id}-edit`}>
                      <td colSpan={4} className="border-b border-line/80 bg-brand-50/35 px-4 py-5">
                        <form action={upsertExpenseCategoryAction} className="grid gap-4 md:grid-cols-3">
                          <input type="hidden" name="id" value={category.id} />
                          <AdminField label="Name" required>
                            <Input name="name" defaultValue={category.name} required />
                          </AdminField>
                          <AdminField label="Slug" required>
                            <Input name="slug" defaultValue={category.slug} required />
                          </AdminField>
                          <AdminField label="Color" required>
                            <Input type="color" name="color" defaultValue={category.color} className="h-11 p-2" required />
                          </AdminField>
                          <div className="md:col-span-3 flex flex-wrap justify-end gap-3">
                            <Button asChild variant="secondary">
                              <Link href="/admin/expenses/settings">Cancel</Link>
                            </Button>
                            <SubmitButton>Save changes</SubmitButton>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null
                ];
              })}
            </tbody>
          </AdminDataTable>
        ) : (
          <EmptyState title="Belum ada kategori expense" description="Tambahkan kategori pertama agar expense record bisa diklasifikasikan dengan rapi." />
        )}
      </section>
    </AdminShell>
  );
}