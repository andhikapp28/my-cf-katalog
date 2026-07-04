import "server-only";
import { redirect } from "next/navigation";
import type { z } from "zod";

/**
 * Validasi FormData dengan Zod tanpa melempar error 500.
 *
 * Bila validasi gagal, alih-alih `.parse()` yang melempar ZodError (→ error
 * boundary / HTTP 500), helper ini memakai `.safeParse()` lalu `redirect()`
 * ke `errorRedirect` (pola `?error=` + toast). `redirect()` melempar
 * NEXT_REDIRECT dan bertipe `never`, sehingga TypeScript menyempitkan tipe
 * hasil ke branch sukses setelah blok if — `result.data` aman diakses.
 *
 * Catatan: JANGAN membungkus pemanggilan ini dalam try/catch yang menelan
 * error, karena akan menangkap NEXT_REDIRECT dan merusak alur redirect.
 */
export function parseFormData<Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: unknown,
  errorRedirect: string
): z.infer<Schema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    redirect(errorRedirect);
  }

  return result.data;
}
