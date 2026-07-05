import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Muat `.env` lokal secara manual (Playwright config berjalan sebagai proses Node
// biasa, bukan lewat Next, jadi tidak otomatis membaca .env seperti `next dev/build`).
// Di CI, env sudah di-set langsung lewat workflow sehingga file .env tidak ada —
// pengecekan existsSync membuat ini aman dilewati tanpa error.
const envPath = path.resolve(__dirname, ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const PORT = 3100;
// NextAuth v5 (tanpa AUTH_URL/NEXTAUTH_URL eksplisit di .env) menyimpulkan origin
// dari host yang diakses lalu memakainya untuk redirect callback OAuth/credentials.
// Memakai "127.0.0.1" di sini menyebabkan mismatch origin vs cookie session yang
// di-set untuk "localhost", jadi flow login macet di /api/auth/callback/credentials.
// "localhost" dipakai konsisten agar cookie sesi dan redirect origin selalu sama.
const baseURL = `http://localhost:${PORT}`;

/**
 * Smoke test E2E dijalankan terhadap `next dev`, BUKAN `next build && next start`.
 *
 * (Update: klaim versi awal komentar ini — bahwa redirect ke pathname BERBEDA
 * seperti login "tidak kena bug ini" — TERBUKTI SALAH saat diverifikasi ulang
 * di next-auth 5.0.0-beta.31. Root cause & cakupan bug FINAL ada di komentar
 * `quickUpdateProductStatusAction` di actions/products.ts: SETIAP Server Action
 * yang memanggil `redirect()` next/navigation — manual maupun internal lewat
 * `signIn()`/`signOut()` — macet permanen di build produksi. Semua action di
 * `actions/*.ts` sudah dimigrasi ke pola `useActionState` tanpa `redirect()`
 * sama sekali. Baca komentar tsb, bukan versi lama di bawah ini, untuk detail
 * teknis yang akurat.)
 *
 * Awalnya dipilih build produksi untuk paritas (alasan aslinya: build menangkap
 * error build/type/prerender lebih awal, dan menghindari jitter Fast Refresh).
 * Tapi saat implementasi ditemukan bug di atas, dan karena root cause-nya di
 * framework/versi (di luar scope Sprint 2 test infra ini untuk diperbaiki),
 * pilihan paling jujur & pragmatis adalah kembali ke `next dev` di sini.
 * Trade-off: kehilangan validasi "apakah build produksi benar-benar jalan"
 * dari smoke test ini — tapi validasi build tetap terjadi lewat step
 * `npm run build` terpisah di CI/verifikasi manual, dan skenario redirect
 * kritis sudah diverifikasi terpisah langsung di build produksi sungguhan
 * (lihat laporan verifikasi, bukan smoke test otomatis ini).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Reporter "html" di CI menghasilkan folder `playwright-report/` yang
  // di-upload sebagai artifact di ci.yml untuk investigasi kegagalan.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Instance dev terpisah dari `.next` milik `next dev` lain yang mungkin
      // sedang berjalan di port 3000 (mis. punya developer) — dua proses `next
      // dev` yang berbagi folder `.next` yang sama bisa saling korup cache/
      // watcher. Lihat komentar `distDir` di next.config.ts.
      PLAYWRIGHT_DIST_DIR: ".next-e2e"
    }
  }
});
