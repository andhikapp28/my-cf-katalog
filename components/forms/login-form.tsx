"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState = {} as { error?: string };

export function LoginForm() {
  const [state, formAction] = useActionState(authenticate, initialState);

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


