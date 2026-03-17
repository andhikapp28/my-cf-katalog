"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { ensureAdminUser } from "@/lib/bootstrap";
import { requireAdmin } from "@/lib/auth";

type LoginState = {
  error?: string;
};

export async function authenticate(_: LoginState, formData: FormData): Promise<LoginState> {
  await ensureAdminUser();

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin"
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Email atau password tidak valid."
      };
    }

    throw error;
  }
}

export async function logoutAction() {
  await requireAdmin();
  await signOut({ redirectTo: "/admin/login" });
}


