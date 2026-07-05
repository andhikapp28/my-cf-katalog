"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { ensureAdminUser } from "@/lib/bootstrap";
import { requireAdmin } from "@/lib/auth";

export type LoginState = {
  error?: string;
  success?: boolean;
};

/**
 * Login admin. TIDAK memakai `redirectTo` + redirect otomatis dari
 * `signIn()`.
 *
 * Root cause bug hang produksi (detail lengkap di actions/products.ts) awalnya
 * diduga hanya menyerang `redirect()` MANUAL dari Server Action, dan login
 * (redirect ke pathname BERBEDA, /admin/login -> /admin, ditangani `signIn()`
 * internal next-auth bukan `redirect()` manual) sempat dicatat "aman". Itu
 * TERBUKTI SALAH saat diverifikasi ulang di build produksi sungguhan (next
 * build && next start, dist dir & port terisolasi) dengan versi yang memang
 * terpasang di package.json (next 15.5.20, next-auth 5.0.0-beta.31):
 *
 *   - Login dengan `signIn("credentials", { redirectTo: "/admin" })` (perilaku
 *     lama) membuat tombol submit macet di "Memproses..." >40 detik, form
 *     TIDAK PERNAH pindah dari /admin/login.
 *   - TAPI cookie sesi (`authjs.session-token`) SUDAH ter-set benar oleh
 *     server saat itu juga — dibuktikan dengan membuka /admin secara manual
 *     (page.goto, bukan lewat redirect Server Action) di browser context yang
 *     sama persis saat form masih macet: langsung masuk ke Admin Dashboard
 *     tanpa perlu login ulang.
 *   - Kesimpulan: `signIn()` next-auth v5 memanggil `redirect()` next/navigation
 *     SECARA INTERNAL ketika opsi `redirect` tidak di-set `false` (lihat
 *     node_modules/next-auth/lib/actions.js) — sama persis dengan root cause
 *     redirect() manual di action lain. Login BUKAN pengecualian dari bug ini.
 *
 * Fix: panggil `signIn()` dengan `redirect: false` (mengembalikan URL tujuan
 * alih-alih memanggil `redirect()`), lalu kembalikan `{ success: true }` ke
 * caller. Caller (`components/forms/login-form.tsx`) melakukan navigasi ke
 * /admin lewat `router.push()` CLIENT-SIDE murni (next/navigation, dipanggil
 * dari client component biasa di dalam useEffect, BUKAN oleh Server Action) —
 * ini mekanisme yang SEPENUHNYA BERBEDA dari redirect Server Action yang
 * bermasalah, dan sudah diverifikasi terpisah di build produksi yang sama:
 * `router.push("/admin")` dari client component resolve dalam hitungan ratus
 * milidetik setelah `state.success` diterima, TIDAK macet. Detail pengukuran
 * ada di laporan verifikasi (bukan di komentar kode ini supaya tidak basi).
 */
export async function authenticate(_: LoginState, formData: FormData): Promise<LoginState> {
  await ensureAdminUser();

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirect: false
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Email atau password tidak valid."
      };
    }

    throw error;
  }
}

export type LogoutState = {
  success?: boolean;
  error?: string;
};

/**
 * Logout admin. Sama seperti `authenticate()` di atas: `signOut()` dipanggil
 * dengan `redirect: false` supaya tidak melewati jalur `redirect()` internal
 * next-auth yang macet di build produksi. Caller (`components/admin/sign-out-
 * button.tsx`) menavigasi ke /admin/login lewat `router.push()` client-side
 * setelah menerima `{ success: true }`.
 */
export async function logoutAction(_: LogoutState, _formData: FormData): Promise<LogoutState> {
  await requireAdmin();
  await signOut({ redirect: false });
  return { success: true };
}


