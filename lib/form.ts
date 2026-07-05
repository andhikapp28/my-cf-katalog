import "server-only";
import type { z } from "zod";

/**
 * Validasi FormData dengan Zod tanpa melempar error 500, dipakai oleh Server
 * Action bergaya `useActionState` (action menerima `(prevState, formData)` dan
 * MENGEMBALIKAN `{ error }`/`{ data }`, TIDAK PERNAH memanggil `redirect()`).
 *
 * Versi sebelumnya dari helper ini (`parseFormData`) me-redirect ke URL
 * `?error=...` saat validasi gagal. Itu dihapus karena `redirect()` dari
 * Server Action terbukti membuat client Next.js macet permanen di build
 * produksi sungguhan (next 15.5.20 + next-auth 5.0.0-beta.31) — lihat catatan
 * lengkap di `actions/products.ts` dan `playwright.config.ts`. Semua action
 * di app ini sekarang memakai pola `useActionState`, jadi validasi juga harus
 * mengembalikan state, bukan redirect.
 */
export function safeParseFormData<Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: unknown
): { success: true; data: z.infer<Schema> } | { success: false; error: string } {
  const result = schema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: "Data yang dikirim tidak valid. Periksa kembali isian form."
    };
  }

  return { success: true, data: result.data };
}
