import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Kredensial admin WAJIB berasal dari environment (`.env` lokal / env CI),
 * bukan hardcode, supaya test tetap valid di lingkungan mana pun dan tidak
 * pernah membocorkan password lain selain yang memang dipakai untuk seed.
 */
export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL / ADMIN_PASSWORD belum di-set di environment. Isi .env atau env CI sebelum menjalankan e2e test."
    );
  }

  return { email, password };
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = getAdminCredentials();

  await page.goto("/admin/login");
  // Label di form login tidak punya `htmlFor`/`id` yang terasosiasi (lihat
  // components/forms/login-form.tsx), jadi pakai selector `name` langsung
  // alih-alih `getByLabel` yang mengandalkan asosiasi label<->input.
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Masuk ke admin panel" }).click();

  // `authenticate()` (actions/auth.ts) memanggil `signIn(..., { redirect: false })`
  // dan mengembalikan `{ success: true }` lewat `useActionState` — TIDAK pernah
  // redirect dari Server Action (redirect internal next-auth terbukti kena bug
  // hang produksi yang sama, lihat komentar panjang di actions/products.ts).
  // Navigasi ke /admin dilakukan `login-form.tsx` lewat `router.push()` client-side
  // murni setelah `state.success` diterima. Pakai `expect(...).toHaveURL` (polling
  // `page.url()`) alih-alih `page.waitForURL` — yang terakhir menunggu event "load"
  // penuh (termasuk gambar eksternal banner event dari Unsplash yang bisa lambat/
  // gagal di lingkungan sandboxed) dan pernah terbukti gantung >20s walau navigasi
  // SPA-nya sendiri sudah berpindah URL jauh lebih cepat.
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
}
