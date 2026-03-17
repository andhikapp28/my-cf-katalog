export const dynamic = "force-dynamic";

import {
  deleteExpenseAction,
  deleteExpenseCategoryAction,
  upsertExpenseAction,
  upsertExpenseCategoryAction
} from "@/actions/expenses";
import { AdminShell } from "@/components/layout/admin-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getEventList, getExpenseCategories, getExpensesAdmin, getProducts } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminExpensesPage() {
  const [events, categories, products, expenses] = await Promise.all([
    getEventList(),
    getExpenseCategories(),
    getProducts(),
    getExpensesAdmin()
  ]);

  return (
    <AdminShell title="Expenses" description="Kelola kategori expense, planned/actual records, payment method, dan hubungan expense ke produk bila diperlukan.">
      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Add category</h2>
            <form action={upsertExpenseCategoryAction} className="mt-5 space-y-4">
              <Input name="name" placeholder="Merchandise" required />
              <Input name="slug" placeholder="merchandise" required />
              <Input type="color" name="color" defaultValue="#D46A3A" />
              <SubmitButton>Save category</SubmitButton>
            </form>
          </section>

          <section className="panel p-5">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Add expense</h2>
            <form action={upsertExpenseAction} className="mt-5 space-y-4">
              <Select name="eventId" required><option value="">Select event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</Select>
              <Select name="productId"><option value="">General expense</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</Select>
              <Select name="categoryId" required><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
              <Input type="number" name="amount" placeholder="60000" required />
              <Input type="date" name="expenseDate" required />
              <Select name="paymentMethod" defaultValue="CASH"><option value="CASH">CASH</option><option value="QRIS">QRIS</option><option value="CARD">CARD</option><option value="BANK_TRANSFER">BANK_TRANSFER</option><option value="E_WALLET">E_WALLET</option><option value="OTHER">OTHER</option></Select>
              <Textarea name="note" placeholder="Catatan expense" />
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-ink-700">
                <label className="flex items-center gap-3"><input type="checkbox" name="isPlanned" className="h-4 w-4" /> Planned</label>
                <label className="flex items-center gap-3"><input type="checkbox" name="isActual" className="h-4 w-4" defaultChecked /> Actual</label>
              </div>
              <SubmitButton>Save expense</SubmitButton>
            </form>
          </section>
        </div>

        <section className="space-y-6">
          <div className="panel p-5">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Expense categories</h2>
            <div className="mt-5 space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-line bg-white/70 p-4">
                  <form action={upsertExpenseCategoryAction} className="grid gap-3 md:grid-cols-[1fr_1fr_110px_auto] md:items-center">
                    <input type="hidden" name="id" value={category.id} />
                    <Input name="name" defaultValue={category.name} required />
                    <Input name="slug" defaultValue={category.slug} required />
                    <Input type="color" name="color" defaultValue={category.color} />
                    <SubmitButton>Save</SubmitButton>
                  </form>
                  <form action={deleteExpenseCategoryAction} className="mt-3 text-right">
                    <input type="hidden" name="id" value={category.id} />
                    <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                  </form>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Expense records</h2>
            <div className="mt-5 space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="rounded-2xl border border-line bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-900">{expense.product?.name || expense.category.name}</p>
                      <p className="mt-1 text-sm text-ink-500">{expense.event.name} â€¢ {formatDate(expense.expenseDate)} â€¢ {expense.paymentMethod}</p>
                      <p className="mt-2 text-sm text-ink-700">{formatCurrency(expense.amount)}</p>
                    </div>
                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="id" value={expense.id} />
                      <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
                    </form>
                  </div>
                  <form action={upsertExpenseAction} className="mt-5 grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="id" value={expense.id} />
                    <Select name="eventId" defaultValue={expense.eventId} required>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</Select>
                    <Select name="productId" defaultValue={expense.productId ?? ""}><option value="">General expense</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</Select>
                    <Select name="categoryId" defaultValue={expense.categoryId} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
                    <Input type="number" name="amount" defaultValue={expense.amount} required />
                    <Input type="date" name="expenseDate" defaultValue={expense.expenseDate} required />
                    <Select name="paymentMethod" defaultValue={expense.paymentMethod}><option value="CASH">CASH</option><option value="QRIS">QRIS</option><option value="CARD">CARD</option><option value="BANK_TRANSFER">BANK_TRANSFER</option><option value="E_WALLET">E_WALLET</option><option value="OTHER">OTHER</option></Select>
                    <div className="md:col-span-2"><Textarea name="note" defaultValue={expense.note ?? ""} /></div>
                    <label className="flex items-center gap-3 text-sm text-ink-700"><input type="checkbox" name="isPlanned" defaultChecked={expense.isPlanned} className="h-4 w-4" /> Planned</label>
                    <label className="flex items-center gap-3 text-sm text-ink-700"><input type="checkbox" name="isActual" defaultChecked={expense.isActual} className="h-4 w-4" /> Actual</label>
                    <div className="md:col-span-2 md:text-right"><SubmitButton>Save changes</SubmitButton></div>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}


