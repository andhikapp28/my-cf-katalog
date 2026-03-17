export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteExpenseAction, upsertExpenseAction } from "@/actions/expenses";
import {
  AdminActionButton,
  AdminActionDropdown,
  AdminActionLink
} from "@/components/admin/admin-action-dropdown";
import { AdminCreatePanel } from "@/components/admin/admin-create-panel";
import { AdminDataTable, AdminTableCell, AdminTableHead } from "@/components/admin/admin-data-table";
import { AdminField } from "@/components/admin/admin-field";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSectionHeading } from "@/components/admin/admin-section-heading";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getEventList, getExpenseCategories, getExpensesAdmin, getProducts } from "@/db/queries";
import {
  buildPathWithQuery,
  formatEnumLabel,
  getPageParam,
  getSearchParam,
  paginateItems,
  truncateText,
  type SearchParams
} from "@/lib/admin-ui";
import { paymentMethods } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

const notesClampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden"
};

export default async function AdminExpensesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const eventId = getSearchParam(params, "event");
  const editId = getSearchParam(params, "edit");
  const pageParam = getPageParam(params);

  const [events, categories, products, expenses] = await Promise.all([
    getEventList(),
    getExpenseCategories(),
    getProducts(eventId ? { eventId } : {}),
    getExpensesAdmin(eventId)
  ]);

  const totalPlanned = expenses.filter((expense) => expense.isPlanned).reduce((sum, expense) => sum + expense.amount, 0);
  const totalActual = expenses.filter((expense) => expense.isActual).reduce((sum, expense) => sum + expense.amount, 0);
  const categorySummary = categories
    .map((category) => ({
      ...category,
      total: expenses
        .filter((expense) => expense.isActual && expense.categoryId === category.id)
        .reduce((sum, expense) => sum + expense.amount, 0)
    }))
    .filter((category) => category.total > 0)
    .sort((left, right) => right.total - left.total)
    .slice(0, 6);

  const pagination = paginateItems(expenses, pageParam, 10);
  const sharedQuery = { event: eventId, page: pagination.page > 1 ? String(pagination.page) : undefined };
  const selectedExpense = expenses.find((expense) => expense.id === editId);
  const selectedEvent = events.find((event) => event.id === eventId);

  return (
    <AdminShell
      title="Expenses"
      description="Kelola expense record, planned vs actual spending, payment method, dan hubungan expense ke produk tanpa mencampur pengaturan kategori di halaman utama."
    >
      <section className="space-y-5">
        <AdminSectionHeading
          title="Expense overview"
          description={selectedEvent ? `Ringkasan saat ini difilter ke ${selectedEvent.name}.` : "Ringkasan ini mengambil seluruh expense record yang ada di admin."}
          actions={
            <>
              <Button asChild>
                <Link href="#expense-create">Add expense</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/expenses/settings">Settings category</Link>
              </Button>
            </>
          }
        />

        <form className="panel grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
          <AdminField label="Filter event">
            <Select name="event" defaultValue={eventId}>
              <option value="">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <Button type="submit">Apply</Button>
          <Button asChild variant="secondary">
            <Link href="/admin/expenses">Reset</Link>
          </Button>
        </form>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <SummaryCard label="Records" value={`${expenses.length}`} helper="Jumlah record sesuai filter aktif." />
          <SummaryCard label="Planned" value={totalPlanned} helper="Akumulasi expense dengan status planned." />
          <SummaryCard label="Actual" value={totalActual} helper="Total pengeluaran aktual yang sudah tercatat." />
          <SummaryCard label="Diff" value={totalActual - totalPlanned} helper="Selisih actual dikurangi planned." />
        </div>

        {categorySummary.length ? (
          <div className="panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Actual by category</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {categorySummary.map((category) => (
                <div key={category.id} className="rounded-2xl border border-line bg-white/70 px-4 py-3" style={{ borderLeftColor: category.color, borderLeftWidth: 4 }}>
                  <p className="text-sm font-semibold text-ink-900">{category.name}</p>
                  <p className="mt-1 text-sm text-ink-500">{formatCurrency(category.total)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <AdminCreatePanel
        title="Add expense"
        description="Fokus halaman ini hanya untuk expense record. Pengaturan kategori dipisah ke halaman settings agar area kerja tetap bersih."
        className="scroll-mt-24"
      >
        <div id="expense-create" />
        <form action={upsertExpenseAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminField label="Event" required>
            <Select name="eventId" defaultValue={eventId} required>
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Linked product">
            <Select name="productId">
              <option value="">General expense</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Category" required>
            <Select name="categoryId" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Amount" required>
            <Input type="number" name="amount" placeholder="60000" required />
          </AdminField>
          <AdminField label="Expense date" required>
            <Input type="date" name="expenseDate" required />
          </AdminField>
          <AdminField label="Payment method">
            <Select name="paymentMethod" defaultValue="CASH">
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </AdminField>
          <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
            <Textarea name="note" placeholder="Catatan expense" />
          </AdminField>
          <div className="md:col-span-2 xl:col-span-3 grid gap-3 sm:grid-cols-2 text-sm text-ink-700">
            <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-3">
              <input type="checkbox" name="isPlanned" className="h-4 w-4" /> Planned
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-3">
              <input type="checkbox" name="isActual" className="h-4 w-4" defaultChecked /> Actual
            </label>
          </div>
          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <SubmitButton>Save expense</SubmitButton>
          </div>
        </form>
      </AdminCreatePanel>

      {selectedExpense ? (
        <AdminCreatePanel
          title={`Edit expense: ${selectedExpense.product?.name ?? selectedExpense.category.name}`}
          description="Edit dilakukan di panel terpisah agar daftar record tetap tenang dan fokus."
        >
          <form action={upsertExpenseAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input type="hidden" name="id" value={selectedExpense.id} />
            <AdminField label="Event" required>
              <Select name="eventId" defaultValue={selectedExpense.eventId} required>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Linked product">
              <Select name="productId" defaultValue={selectedExpense.productId ?? ""}>
                <option value="">General expense</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Category" required>
              <Select name="categoryId" defaultValue={selectedExpense.categoryId} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Amount" required>
              <Input type="number" name="amount" defaultValue={selectedExpense.amount} required />
            </AdminField>
            <AdminField label="Expense date" required>
              <Input type="date" name="expenseDate" defaultValue={selectedExpense.expenseDate} required />
            </AdminField>
            <AdminField label="Payment method">
              <Select name="paymentMethod" defaultValue={selectedExpense.paymentMethod}>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </AdminField>
            <AdminField label="Notes" className="md:col-span-2 xl:col-span-3">
              <Textarea name="note" defaultValue={selectedExpense.note ?? ""} />
            </AdminField>
            <div className="md:col-span-2 xl:col-span-3 grid gap-3 sm:grid-cols-2 text-sm text-ink-700">
              <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-3">
                <input type="checkbox" name="isPlanned" defaultChecked={selectedExpense.isPlanned} className="h-4 w-4" /> Planned
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-3">
                <input type="checkbox" name="isActual" defaultChecked={selectedExpense.isActual} className="h-4 w-4" /> Actual
              </label>
            </div>
            <div className="md:col-span-2 xl:col-span-3 flex flex-wrap justify-end gap-3">
              <Button asChild variant="secondary">
                <Link href={buildPathWithQuery("/admin/expenses", sharedQuery)}>Cancel</Link>
              </Button>
              <SubmitButton>Save changes</SubmitButton>
            </div>
          </form>
        </AdminCreatePanel>
      ) : null}

      <section className="space-y-4">
        <AdminSectionHeading
          title="Expense records"
          description={`${pagination.totalItems} record tampil. Desktop memakai tabel compact, mobile memakai kartu ringkas agar tidak dipaksa scroll horizontal.`}
          actions={
            <Button asChild variant="secondary">
              <Link href="/admin/expenses/settings">Manage categories</Link>
            </Button>
          }
        />

        {pagination.totalItems ? (
          <>
            <div className="grid gap-4 lg:hidden">
              {pagination.items.map((expense) => (
                <article key={expense.id} className="panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-[var(--font-display)] text-xl font-semibold text-ink-900">{expense.product?.name ?? expense.category.name}</p>
                      <p className="mt-1 text-sm text-ink-500">{formatDate(expense.expenseDate)} - {expense.event.name}</p>
                    </div>
                    <AdminActionDropdown>
                      <AdminActionLink href={buildPathWithQuery("/admin/expenses", { ...sharedQuery, edit: expense.id })}>
                        Edit
                      </AdminActionLink>
                      <form action={deleteExpenseAction}>
                        <input type="hidden" name="id" value={expense.id} />
                        <AdminActionButton type="submit" destructive>
                          Delete
                        </AdminActionButton>
                      </form>
                    </AdminActionDropdown>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Category</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: expense.category.color }} />
                        <span className="font-medium text-ink-900">{expense.category.name}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Amount</p>
                      <p className="mt-2 font-semibold text-ink-900">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Payment</p>
                      <p className="mt-2 font-medium text-ink-900">{formatEnumLabel(expense.paymentMethod)}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">State</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {expense.isPlanned ? <Badge className="bg-amber-100 text-amber-800 ring-amber-200">Planned</Badge> : null}
                        {expense.isActual ? <Badge className="bg-emerald-100 text-emerald-800 ring-emerald-200">Actual</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-line bg-white/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Notes</p>
                    <p className="mt-2 text-sm leading-6 text-ink-600" style={notesClampStyle}>{expense.note || "No additional note."}</p>
                  </div>
                </article>
              ))}
            </div>

            <AdminDataTable className="hidden lg:block" tableClassName="w-full table-fixed">
              <thead>
                <tr>
                  <AdminTableHead className="w-[11%] px-3">Date</AdminTableHead>
                  <AdminTableHead className="w-[14%] px-3">Event</AdminTableHead>
                  <AdminTableHead className="w-[17%] px-3">Category</AdminTableHead>
                  <AdminTableHead className="w-[18%] px-3">Linked product</AdminTableHead>
                  <AdminTableHead className="w-[12%] px-3">Amount</AdminTableHead>
                  <AdminTableHead className="w-[12%] px-3">Payment</AdminTableHead>
                  <AdminTableHead className="w-[10%] px-3">State</AdminTableHead>
                  <AdminTableHead className="hidden w-[16%] px-3 xl:table-cell">Notes</AdminTableHead>
                  <AdminTableHead className="w-[6%] px-3 text-right">Actions</AdminTableHead>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((expense) => (
                  <tr key={expense.id} className="bg-white/80 align-top hover:bg-brand-50/30">
                    <AdminTableCell className="px-3 py-3 align-middle text-ink-600">{formatDate(expense.expenseDate)}</AdminTableCell>
                    <AdminTableCell className="px-3 py-3 align-middle">
                      <p className="truncate font-medium text-ink-900">{expense.event.name}</p>
                    </AdminTableCell>
                    <AdminTableCell className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: expense.category.color }} />
                        <span className="truncate">{expense.category.name}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="px-3 py-3 align-middle">
                      <span className="block truncate">{expense.product?.name ?? "General expense"}</span>
                    </AdminTableCell>
                    <AdminTableCell className="px-3 py-3 align-middle font-medium text-ink-900">{formatCurrency(expense.amount)}</AdminTableCell>
                    <AdminTableCell className="px-3 py-3 align-middle text-ink-600">{formatEnumLabel(expense.paymentMethod)}</AdminTableCell>
                    <AdminTableCell className="px-3 py-3 align-middle">
                      <div className="flex flex-wrap gap-2">
                        {expense.isPlanned ? <Badge className="bg-amber-100 text-amber-800 ring-amber-200">Planned</Badge> : null}
                        {expense.isActual ? <Badge className="bg-emerald-100 text-emerald-800 ring-emerald-200">Actual</Badge> : null}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="hidden px-3 py-3 text-ink-600 xl:table-cell">
                      <p style={notesClampStyle}>{expense.note || "-"}</p>
                    </AdminTableCell>
                    <AdminTableCell className="px-3 py-3 text-right">
                      <AdminActionDropdown>
                        <AdminActionLink href={buildPathWithQuery("/admin/expenses", { ...sharedQuery, edit: expense.id })}>
                          Edit
                        </AdminActionLink>
                        <form action={deleteExpenseAction}>
                          <input type="hidden" name="id" value={expense.id} />
                          <AdminActionButton type="submit" destructive>
                            Delete
                          </AdminActionButton>
                        </form>
                      </AdminActionDropdown>
                    </AdminTableCell>
                  </tr>
                ))}
              </tbody>
            </AdminDataTable>

            <AdminPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              pathname="/admin/expenses"
              query={{ event: eventId }}
            />
          </>
        ) : (
          <EmptyState title="Belum ada expense record" description="Tambahkan expense pertama untuk mulai melacak planned dan actual spending." />
        )}
      </section>
    </AdminShell>
  );
}