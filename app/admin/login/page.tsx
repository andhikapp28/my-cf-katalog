export const dynamic = "force-dynamic";

import { LoginForm } from "@/components/forms/login-form";

export default function AdminLoginPage() {
  return (
    <div className="container-shell py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Admin Access</p>
          <h1 className="font-[var(--font-display)] text-4xl font-semibold tracking-tight text-ink-900 md:text-5xl">
            Kelola katalog Comifuro dari satu panel yang ringan.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-ink-600 md:text-base">
            Login hanya diperlukan untuk CRUD data. Semua halaman publik tetap bisa dibaca tanpa autentikasi, sementara perubahan data dibatasi untuk admin personal.
          </p>
        </div>
        <div className="panel p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Credentials Sign In</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold">Admin login</h2>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}


