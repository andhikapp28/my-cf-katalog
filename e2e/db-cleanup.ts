import postgres from "postgres";

/**
 * Safety net pembersihan data uji E2E langsung ke database, dipanggil dari
 * `test.afterAll`. Alur utama sudah menghapus produk lewat UI (delete button),
 * tapi ini jaring pengaman kalau ada assertion di tengah test yang gagal
 * sebelum langkah delete UI sempat jalan — supaya database dev tidak pernah
 * kotor oleh sisa data uji meskipun test itu sendiri gagal.
 */
export async function deleteTestProductsByPrefix(prefix: string) {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return;
  }

  const sql = postgres(url, { max: 1, prepare: false });

  try {
    await sql`DELETE FROM products WHERE name LIKE ${prefix + "%"}`;
  } finally {
    await sql.end();
  }
}
