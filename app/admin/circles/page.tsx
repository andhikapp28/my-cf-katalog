export const dynamic = "force-dynamic";

import Link from "next/link";
import { deleteCircleAction, upsertCircleAction } from "@/actions/circles";
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
import { SubmitButton } from "@/components/forms/submit-button";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCircleList } from "@/db/queries";
import {
  buildPathWithQuery,
  compactUrl,
  getPageParam,
  getSearchParam,
  paginateItems,
  truncateText,
  type SearchParams
} from "@/lib/admin-ui";

const notesClampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden"
};

export default async function AdminCirclesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const editId = getSearchParam(params, "edit");
  const pageParam = getPageParam(params);
  const circles = await getCircleList();
  const pagination = paginateItems(circles, pageParam, 10);
  const pageQuery = pagination.page > 1 ? String(pagination.page) : undefined;

  return (
    <AdminShell title="Circles" description="Kelola directory circle global, link sosial utama, dan catatan yang nanti dipakai ulang lintas event.">
      <AdminCreatePanel
        title="Add circle"
        description="Buat entri circle yang bisa dipakai ulang di berbagai event, produk, dan marker booth."
      >
        <form action={upsertCircleAction} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Circle name" required>
            <Input name="name" placeholder="Atelier Hanami" required />
          </AdminField>
          <AdminField label="Slug" required>
            <Input name="slug" placeholder="atelier-hanami" required />
          </AdminField>
          <AdminField label="Main social link" className="md:col-span-2">
            <Input name="socialLink" placeholder="https://instagram.com/atelierhanami" />
          </AdminField>
          <AdminField label="Notes" className="md:col-span-2">
            <Textarea name="notes" placeholder="Catatan circle, style merch, atau reminder khusus." />
          </AdminField>
          <div className="md:col-span-2 flex justify-end">
            <SubmitButton>Create circle</SubmitButton>
          </div>
        </form>
      </AdminCreatePanel>

      <section className="space-y-4">
        <AdminSectionHeading
          title="Circle directory"
          description={`${pagination.totalItems} circle tersimpan. Daftar dibuat lebih ringkas agar tetap stabil saat data makin panjang.`}
        />

        {pagination.totalItems ? (
          <>
            <div className="space-y-3 md:hidden">
              {pagination.items.map((circle) => {
                const isEditing = editId === circle.id;

                return (
                  <article key={circle.id} className="panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-[var(--font-display)] text-xl font-semibold text-ink-900">{circle.name}</h3>
                        <p className="mt-1 text-sm text-ink-500">{circle.slug}</p>
                      </div>
                      <AdminActionDropdown>
                        <AdminActionLink href={isEditing ? buildPathWithQuery("/admin/circles", { page: pageQuery }) : buildPathWithQuery("/admin/circles", { edit: circle.id, page: pageQuery })}>
                          {isEditing ? "Close editor" : "Edit"}
                        </AdminActionLink>
                        <form action={deleteCircleAction}>
                          <input type="hidden" name="id" value={circle.id} />
                          <AdminActionButton type="submit" destructive>
                            Delete
                          </AdminActionButton>
                        </form>
                      </AdminActionDropdown>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Main social link</p>
                        {circle.socialLink ? (
                          <a href={circle.socialLink} target="_blank" rel="noreferrer" className="mt-1 block font-medium text-brand-700">
                            {compactUrl(circle.socialLink, 30)}
                          </a>
                        ) : (
                          <p className="mt-1 text-ink-400">-</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Notes</p>
                        <p className="mt-1 leading-6 text-ink-600" style={notesClampStyle}>{circle.notes || "-"}</p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-4 border-t border-line/80 pt-4">
                        <form action={upsertCircleAction} className="grid gap-4">
                          <input type="hidden" name="id" value={circle.id} />
                          <AdminField label="Circle name" required>
                            <Input name="name" defaultValue={circle.name} required />
                          </AdminField>
                          <AdminField label="Slug" required>
                            <Input name="slug" defaultValue={circle.slug} required />
                          </AdminField>
                          <AdminField label="Main social link">
                            <Input name="socialLink" defaultValue={circle.socialLink ?? ""} />
                          </AdminField>
                          <AdminField label="Notes">
                            <Textarea name="notes" defaultValue={circle.notes ?? ""} />
                          </AdminField>
                          <div className="flex flex-wrap justify-end gap-3">
                            <Button asChild variant="secondary">
                              <Link href={buildPathWithQuery("/admin/circles", { page: pageQuery })}>Cancel</Link>
                            </Button>
                            <SubmitButton>Save changes</SubmitButton>
                          </div>
                        </form>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <AdminDataTable className="hidden md:block" tableClassName="w-full table-fixed">
              <thead>
                <tr>
                  <AdminTableHead className="w-[25%] px-3">Name</AdminTableHead>
                  <AdminTableHead className="w-[18%] px-3">Slug</AdminTableHead>
                  <AdminTableHead className="w-[22%] px-3">Main social link</AdminTableHead>
                  <AdminTableHead className="w-[27%] px-3">Notes</AdminTableHead>
                  <AdminTableHead className="w-[8%] px-3 text-right">Actions</AdminTableHead>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((circle) => {
                  const isEditing = editId === circle.id;

                  return [
                    <tr key={circle.id} className="bg-white/80 hover:bg-brand-50/30">
                      <AdminTableCell className="px-3 py-3">
                        <p className="truncate font-semibold text-ink-900">{circle.name}</p>
                      </AdminTableCell>
                      <AdminTableCell className="px-3 py-3 text-ink-500">{circle.slug}</AdminTableCell>
                      <AdminTableCell className="px-3 py-3">
                        {circle.socialLink ? (
                          <a href={circle.socialLink} target="_blank" rel="noreferrer" className="block truncate font-medium text-brand-700">
                            {compactUrl(circle.socialLink, 28)}
                          </a>
                        ) : (
                          <span className="text-ink-400">-</span>
                        )}
                      </AdminTableCell>
                      <AdminTableCell className="px-3 py-3 text-ink-600">
                        <p style={notesClampStyle}>{circle.notes || "-"}</p>
                      </AdminTableCell>
                      <AdminTableCell className="px-3 py-3 text-right">
                        <AdminActionDropdown>
                          <AdminActionLink href={isEditing ? buildPathWithQuery("/admin/circles", { page: pageQuery }) : buildPathWithQuery("/admin/circles", { edit: circle.id, page: pageQuery })}>
                            {isEditing ? "Close editor" : "Edit"}
                          </AdminActionLink>
                          <form action={deleteCircleAction}>
                            <input type="hidden" name="id" value={circle.id} />
                            <AdminActionButton type="submit" destructive>
                              Delete
                            </AdminActionButton>
                          </form>
                        </AdminActionDropdown>
                      </AdminTableCell>
                    </tr>,
                    isEditing ? (
                      <tr key={`${circle.id}-edit`}>
                        <td colSpan={5} className="border-b border-line/80 bg-brand-50/35 px-4 py-5">
                          <form action={upsertCircleAction} className="grid gap-4 md:grid-cols-2">
                            <input type="hidden" name="id" value={circle.id} />
                            <AdminField label="Circle name" required>
                              <Input name="name" defaultValue={circle.name} required />
                            </AdminField>
                            <AdminField label="Slug" required>
                              <Input name="slug" defaultValue={circle.slug} required />
                            </AdminField>
                            <AdminField label="Main social link" className="md:col-span-2">
                              <Input name="socialLink" defaultValue={circle.socialLink ?? ""} />
                            </AdminField>
                            <AdminField label="Notes" className="md:col-span-2">
                              <Textarea name="notes" defaultValue={circle.notes ?? ""} />
                            </AdminField>
                            <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                              <Button asChild variant="secondary">
                                <Link href={buildPathWithQuery("/admin/circles", { page: pageQuery })}>Cancel</Link>
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

            <AdminPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              pathname="/admin/circles"
              query={{}}
            />
          </>
        ) : (
          <EmptyState title="Belum ada circle" description="Tambahkan circle pertama untuk mulai menghubungkan produk dan lokasi booth." />
        )}
      </section>
    </AdminShell>
  );
}