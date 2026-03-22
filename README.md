# Dipa Katalog

Aplikasi web katalog belanja event anime berbasis event untuk penggunaan personal jangka panjang. Stack utama: Next.js App Router, TypeScript strict, Tailwind CSS, PostgreSQL, Drizzle ORM, Auth.js credentials login, dan Vercel Blob untuk floor map.

## Arsitektur Singkat
- Satu project full-stack Next.js tanpa backend terpisah.
- Server Components untuk halaman utama, server actions untuk CRUD admin.
- PostgreSQL + Drizzle ORM untuk data event, circle, produk, booth, map, expense, dan admin.
- Auth.js credentials + middleware untuk proteksi route `/admin/*`.
- Floor map image disimpan di Vercel Blob.
- Produk menggunakan `imageUrl` biasa, tanpa upload file image.
- Data dipisah per event, dengan circle reusable lintas event melalui booth locations.

## Struktur Folder
```text
.
+- app/
|  +- admin/
|  +- api/auth/[...nextauth]/
|  +- circles/
|  +- events/
|  +- expenses/
|  +- maps/
|  +- products/
|  +- error.tsx
|  +- globals.css
|  +- layout.tsx
|  +- loading.tsx
|  +- not-found.tsx
|  +- page.tsx
+- actions/
+- components/
|  +- admin/
|  +- dashboard/
|  +- forms/
|  +- layout/
|  +- maps/
|  +- products/
|  +- ui/
+- db/
|  +- client.ts
|  +- index.ts
|  +- queries.ts
|  +- schema.ts
|  +- seed.ts
+- drizzle/
|  +- 0000_initial.sql
|  +- 0001_event_banner.sql
+- lib/
+- types/
+- auth.config.ts
+- auth.ts
+- drizzle.config.ts
+- middleware.ts
+- next.config.ts
+- package.json
+- README.md
```

## Fitur Utama
- Dashboard event aktif dengan budget, planned spend, actual spend, priority items, deadline, dan quick links circle.
- Katalog produk dengan search, filter, priority badge, status badge, dan detail produk.
- Produk admin memakai image URL dengan live preview, tanpa upload file.
- Directory circle dan halaman detail circle.
- Floor map listing dan detail map dengan marker booth berbasis koordinat x/y.
- Expense summary per event.
- Admin login credentials.
- Admin CRUD untuk events, circles, floor maps, booth locations, products, expense categories, dan expenses.
- Quick status update produk dan status log history.
- Action dropdown reusable, pagination reusable, dan admin layout responsif.

## Environment Variables
Gunakan `.env.example` untuk local development:

```env
DATABASE_URL=postgres://user:password@host:5432/dipa_katalog
BLOB_READ_WRITE_TOKEN=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-now
AUTH_SECRET=replace-with-a-long-random-string
```

Gunakan `.env.production.example` untuk Vercel production.

Keterangan:
- `DATABASE_URL`: wajib, PostgreSQL yang bisa diakses app.
- `AUTH_SECRET`: wajib, secret session Auth.js.
- `ADMIN_EMAIL`: wajib, email admin awal.
- `ADMIN_PASSWORD`: wajib, password admin awal.
- `BLOB_READ_WRITE_TOKEN`: wajib hanya jika ingin upload floor map image ke Vercel Blob.

## Install
```bash
npm install
```

## Menjalankan Migration
```bash
npm run db:migrate
```

Migration SQL awal tersedia di [drizzle/0000_initial.sql](/d:/Andhika/Code/KatalogCF22/drizzle/0000_initial.sql) dan tambahan banner event di [drizzle/0001_event_banner.sql](/d:/Andhika/Code/KatalogCF22/drizzle/0001_event_banner.sql).

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
1. Push repo ke Git provider.
2. Import project ke Vercel.
3. Tambahkan environment variables di `Project Settings -> Environment Variables`.
4. Minimal isi:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `BLOB_READ_WRITE_TOKEN` jika ingin upload floor map aktif
5. Gunakan PostgreSQL production yang bisa diakses Vercel.
6. Jalankan migration ke database production.
7. Jika perlu sample data, jalankan seed ke database production.
8. Deploy.

## Setup Env Production di Vercel
Contoh template:

```env
DATABASE_URL=postgres://user:password@host:5432/dipa_katalog
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-long-random-password
AUTH_SECRET=generate-a-32-byte-or-longer-random-secret
```

Tips:
- Isi variable minimal di scope `Production`.
- Kalau pakai preview deploy, copy juga ke scope `Preview`.
- Jangan commit file `.env` production ke git.
- Jika mengganti `ADMIN_PASSWORD`, admin akan disinkronkan ulang dari env saat login.
- Jika mengganti `AUTH_SECRET`, session login lama akan invalid.

Generate `AUTH_SECRET` cepat:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Catatan Implementasi
- Public pages memakai revalidate ringan agar lebih hemat query, sementara admin tetap dinamis untuk menjaga konsistensi CRUD berbasis database.
- `db/client.ts` akan memberi error jelas jika `DATABASE_URL` belum diisi.
- Floor map image masih memakai Vercel Blob.
- Produk tidak memakai upload file image; hanya menyimpan `imageUrl` string.
- Marker booth memakai koordinat persentase `0-100` agar tetap proporsional pada berbagai ukuran layar.
- Banner event dan image eksternal yang dipakai oleh `next/image` tetap perlu host yang diizinkan di [next.config.ts](/d:/Andhika/Code/KatalogCF22/next.config.ts).

## Verifikasi
Perintah yang sudah lolos di local:
```bash
npm install
npm run build
```

Build production terakhir berhasil.