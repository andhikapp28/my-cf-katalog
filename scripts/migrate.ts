import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

/**
 * Runner migrasi SQL sederhana.
 *
 * Menerapkan setiap file `drizzle/*.sql` secara berurutan (berdasarkan nama) di
 * dalam satu transaksi per file, dan mencatat yang sudah dijalankan di tabel
 * `_migrations` sehingga aman diulang (idempotent). Cocok untuk migrasi SQL yang
 * ditulis tangan — tidak butuh folder `drizzle/meta` milik drizzle-kit.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL belum di-set. Isi di .env sebelum menjalankan db:migrate.");
    process.exit(1);
  }

  const migrationsDir = join(process.cwd(), "drizzle");
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("Tidak ada file migrasi di folder drizzle/.");
    return;
  }

  const sql = postgres(url, {
    max: 1,
    prepare: false,
    onnotice: (notice) => console.warn(`[notice] ${notice.message}`)
  });

  try {
    await sql`CREATE TABLE IF NOT EXISTS "_migrations" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL UNIQUE,
      "applied_at" timestamptz NOT NULL DEFAULT now()
    )`;

    const rows = await sql`SELECT name FROM "_migrations"`;
    const applied = new Set(rows.map((row) => row.name as string));

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const contents = readFileSync(join(migrationsDir, file), "utf8");
      // Bungkus DDL + pencatatan dalam satu transaksi agar atomik per file.
      await sql.unsafe(
        `BEGIN;\n${contents}\nINSERT INTO "_migrations" (name) VALUES ('${file}');\nCOMMIT;`
      );
      console.log(`applied ${file}`);
      count += 1;
    }

    console.log(count ? `Migrasi selesai (${count} file baru).` : "Database sudah paling baru.");
  } finally {
    await sql.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
