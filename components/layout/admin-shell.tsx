import type { ReactNode } from "react";
import Link from "next/link";
import { adminNavigation } from "@/lib/constants";
import { auth } from "@/auth";
import { SearchParamToast } from "@/components/forms/search-param-toast";
import { SignOutButton } from "@/components/admin/sign-out-button";

export async function AdminShell({
  title,
  description,
  children,
  headerActions
}: {
  title: string;
  description: string;
  children: ReactNode;
  headerActions?: ReactNode;
}) {
  const session = await auth();

  return (
    <div className="container-shell py-8">
      <SearchParamToast />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel h-fit p-4">
          <div className="mb-5 rounded-2xl bg-brand-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-ink-500">Admin</p>
            <h2 className="mt-1 font-[var(--font-display)] text-xl font-semibold text-ink-900">{session?.user.email}</h2>
          </div>
          <nav className="space-y-1">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 pt-4">
            <SignOutButton />
          </div>
        </aside>
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink-500">Admin Workspace</p>
                <h1 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p>
              </div>
              {headerActions ? <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">{headerActions}</div> : null}
            </div>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}