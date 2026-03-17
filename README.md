# Katalog CF22

Aplikasi web katalog belanja Comifuro berbasis event untuk penggunaan personal jangka panjang. Stack utama: Next.js App Router, TypeScript strict, Tailwind CSS, PostgreSQL, Drizzle ORM, Vercel Blob, dan Auth.js credentials login untuk admin.

## Arsitektur Singkat
- Satu project full-stack Next.js tanpa backend Express terpisah.
- Server Components untuk halaman utama, server actions untuk seluruh CRUD admin.
- Drizzle ORM + PostgreSQL untuk data event, circle, produk, booth, map, expense, dan admin user.
- Auth.js credentials dengan proteksi middleware untuk seluruh route `/admin/*`.
- Upload gambar produk dan floor map ke Vercel Blob dengan validasi mime type dan ukuran.
- Data dipisah per event, tetapi circle tetap reusable lintas event melalui booth locations.

## Struktur Folder
```text
.
+- app/
�  +- admin/
�  +- api/auth/[...nextauth]/
�  +- circles/
�  +- events/
�  +- expenses/
�  +- maps/
�  +- products/
�  +- error.tsx
�  +- globals.css
�  +- layout.tsx
�  +- loading.tsx
�  +- not-found.tsx
�  +- page.tsx
+- actions/
+- components/
�  +- admin/
�  +- dashboard/
�  +- forms/
�  +- layout/
�  +- maps/
�  +- products/
�  +- ui/
+- db/
�  +- client.ts
�  +- index.ts
�  +- queries.ts
�  +- schema.ts
�  +- seed.ts
+- drizzle/
�  +- 0000_initial.sql
+- lib/
+- types/
+- auth.config.ts
+- auth.ts
+- components.json
+- drizzle.config.ts
+- middleware.ts
+- next.config.ts
+- package.json
+- README.md
```

## Fitur yang Sudah Diimplementasikan
- Public dashboard event aktif dengan budget, planned spend, actual spend, priority items, deadline, dan quick links circle.
- Katalog produk dengan search, filter status/priority/circle/event, sort, dan detail produk.
- Directory circle dan halaman detail circle.
- Floor map listing dan detail map dengan marker booth berbasis koordinat x/y.
- Expense summary per event.
- Admin login credentials.
- Admin CRUD untuk events, circles, floor maps, booth locations, products, expense categories, dan expenses.
- Quick status update produk dan status log history.
- Upload image produk dan map ke Vercel Blob.

## Environment Variables
Buat file `.env.local` berdasarkan `.env.example`:

```env
DATABASE_URL=postgres://user:password@host:5432/katalog_cf22
BLOB_READ_WRITE_TOKEN=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-now
AUTH_SECRET=replace-with-a-long-random-string
```

## Install
```bash
npm install
```

## Menjalankan Migration
Pilihan paling sederhana:

```bash
npm run db:migrate
```

Jika ingin meninjau SQL awal secara manual, migration pertama tersedia di [drizzle/0000_initial.sql](/d:/Andhika/Code/KatalogCF22/drizzle/0000_initial.sql).

## Seed Data Awal
Seed akan:
- membuat atau sinkronkan admin dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD`
- membuat sample event aktif
- membuat sample circles, floor map, booth locations, products, kategori expense, dan expenses

Jalankan:

```bash
npm run db:seed
```

## Menjalankan Development Server
```bash
npm run dev
```

Lalu buka `http://localhost:3000`.

## Build Production
```bash
npm run build
npm run start
```

## Deploy ke Vercel
1. Push repo ini ke Git provider.
2. Import project ke Vercel.
3. Set semua environment variable di Project Settings.
4. Pastikan `DATABASE_URL` mengarah ke PostgreSQL yang bisa diakses Vercel.
5. Pastikan `BLOB_READ_WRITE_TOKEN` aktif untuk upload image.
6. Deploy.
7. Jalankan migration dan seed pada environment target bila database masih kosong.

## Catatan Implementasi
- Semua route data-heavy dijalankan sebagai dynamic server rendering agar cocok untuk aplikasi pribadi berbasis database dan tidak memaksa pre-render saat build.
- `db/client.ts` sengaja lazy-safe saat `DATABASE_URL` belum tersedia, tetapi query tetap akan gagal dengan error jelas bila env belum diisi.
- Untuk replace image, admin cukup upload file baru. URL lama akan dihapus dari Blob saat pergantian berhasil.
- Marker booth memakai koordinat persentase `0-100`, sehingga tetap proporsional pada berbagai ukuran layar.

## Verifikasi yang Sudah Saya Jalankan
```bash
npm install
npm run build
```

Build production terakhir berhasil.
