"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAction, type LogoutState } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: LogoutState = {};

/**
 * `signOut()` di actions/auth.ts dipanggil dengan `redirect: false` supaya
 * tidak melewati jalur `redirect()` internal next-auth yang macet di build
 * produksi (detail lengkap di actions/auth.ts dan actions/products.ts).
 * Navigasi ke /admin/login jadi tanggung jawab client component ini lewat
 * `router.push()` murni setelah menerima `{ success: true }`.
 */
export function SignOutButton() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(logoutAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/admin/login");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <Button type="submit" variant="secondary" className="w-full justify-center" disabled={isPending}>
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
    </form>
  );
}
