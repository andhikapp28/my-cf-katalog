export const dynamic = "force-dynamic";

import { syncAdminFromEnvAction } from "@/actions/settings";
import { auth } from "@/auth";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const session = await auth();

  return (
    <AdminShell title="Settings" description="Halaman ringan untuk sinkronisasi admin dari environment variable dan verifikasi requirement deploy.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Environment checklist</h2>
            <div className="space-y-3 text-sm text-ink-700">
              <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">DATABASE_URL: {process.env.DATABASE_URL ? "configured" : "missing"}</div>
              <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">BLOB_READ_WRITE_TOKEN: {process.env.BLOB_READ_WRITE_TOKEN ? "configured" : "missing"}</div>
              <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">ADMIN_EMAIL: {process.env.ADMIN_EMAIL ? "configured" : "missing"}</div>
              <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">ADMIN_PASSWORD: {process.env.ADMIN_PASSWORD ? "configured" : "missing"}</div>
              <div className="rounded-2xl border border-line bg-white/70 px-4 py-3">AUTH_SECRET: {process.env.AUTH_SECRET ? "configured" : "missing"}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Admin account</h2>
            <p className="text-sm text-ink-500">Session aktif: {session?.user.email}</p>
            <form action={syncAdminFromEnvAction}>
              <button type="submit" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-medium text-white">Sync admin from env</button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}


