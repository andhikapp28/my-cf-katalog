"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState = {} as { error?: string; success?: boolean };

/**
 * `signIn()` di actions/auth.ts sengaja dipanggil dengan `redirect: false`
 * (lihat komentar panjang di sana) supaya tidak melewati jalur `redirect()`
 * internal next-auth yang macet di build produksi. Navigasi pasca-login jadi
 * tanggung jawab client component ini lewat `router.push()` murni.
 */
export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(authenticate, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-ink-700">Email</label>
        <Input type="email" name="email" required placeholder="admin@example.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-ink-700">Password</label>
        <Input type="password" name="password" required minLength={8} placeholder="••••••••" />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <SubmitButton className="w-full justify-center">Masuk ke admin panel</SubmitButton>
    </form>
  );
}
