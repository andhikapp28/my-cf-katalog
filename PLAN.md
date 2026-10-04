# Rencana Pengembangan ComiPocket

> **Konteks kunci:** aplikasi ini dipakai personal saat *hari-H event* di venue — sering
> dengan sinyal buruk dan sambil berdiri/jalan. Itu jadi lensa utama untuk prioritas:
> keandalan offline, kecepatan, dan UX mobile lebih penting daripada fitur berat.
> Kode saat ini sudah rapi dan konsisten, jadi ini soal penajaman, bukan perombakan.

## Ringkasan temuan per area

### 🔒 Keamanan

| #  | Temuan | Lokasi | Dampak |
|----|--------|--------|--------|
| S1 | `quickUpdateProductStatusAction` meng-cast status dari FormData tanpa validasi Zod (`nextStatus as typeof...`) | `actions/products.ts:100,113,121` | Enum invalid → error DB mentah / 500, bukan pesan rapi |
| S2 | Image optimizer mengizinkan **semua** host (`hostname: "**"`) | `next.config.ts:13` | Next image endpoint bisa dipakai proxy URL sembarang (SSRF/abuse) |
| S3 | Tidak ada rate limiting di login | `auth.ts` | Brute-force password admin terbuka |
| S4 | `ensureAdminUser()` jalan di **setiap** percobaan login (DB read + bcrypt) sebelum kredensial diverifikasi | `auth.ts:20`, `lib/bootstrap.ts` | Vektor pemborosan resource + resync password tiap login |
| S5 | Tidak ada security headers (CSP, X-Frame-Options, HSTS, dll.) | `next.config.ts` | Kurang proteksi clickjacking/XSS baseline |
| S6 | Halaman publik terbuka penuh termasuk budget/expense | seluruh `app/(public)` | By design, tapi data finansial pribadi bisa dilihat siapa pun yang tahu URL |

### ⚙️ Fungsi & kualitas kode

| #  | Temuan | Lokasi |
|----|--------|--------|
| F1 | Inkonsistensi error handling: sebagian action pakai `.parse()` (melempar → error boundary 500), sebagian pola `?error=` toast | `actions/products.ts:14` vs `:106` |
| F2 | Tidak ada test sama sekali & tidak ada CI | seluruh repo |
| F3 | `drizzle/meta` di-gitignore → `db:generate` inkremental bisa tidak akurat | `.gitignore` |
| F4 | `bodySizeLimit: "10mb"` tapi blob dibatasi 5MB — tidak selaras | `next.config.ts:6` vs `lib/blob.ts:4` |
| F5 | README menyisakan path lokal lama (`/d:/Andhika/...`) | `README.md` |
| F6 | Dashboard menarik semua produk/expense ke memori lalu agregasi di JS | `db/queries.ts` |

### 🎨 UI/UX

Desain sudah bagus (branded, responsif, ada mobile bottom-bar). Yang bisa ditingkatkan:
dark mode, skeleton loading, aksesibilitas (alt text produk, focus ring, aria-label),
interaksi floor map (zoom/pan di HP), breadcrumb, dan konsistensi bahasa (campuran EN/ID di UI).

### ✨ Fitur

Katalog, circle, floor map, expense, status log sudah lengkap. Peluang: mode checklist saat
event, upload gambar produk (kini URL saja), notifikasi deadline PO, budget per kategori,
import/export CSV, dan analitik lintas-event.

---

## Roadmap bertahap (prioritas menurun)

### Fase 1 — Keamanan & keandalan (fondasi, kerjakan dulu)

1. **Validasi enum status** — ganti cast di `quickUpdateProductStatusAction` dengan Zod `z.enum(productStatuses)`; kembalikan `?error=invalid-status` bila gagal. *(S1, kecil)*
2. **Batasi host image** — ganti `hostname: "**"` dengan daftar host tepercaya (Vercel Blob, host gambar produk yang benar-benar dipakai). *(S2, kecil)*
3. **Rate limiting login** — batasi percobaan per IP (mis. Upstash Ratelimit atau in-memory sederhana). *(S3, sedang)*
4. **Pindahkan `ensureAdminUser()`** keluar dari jalur login runtime → jadikan skrip seed/bootstrap sekali jalan; hentikan resync password otomatis tiap login. *(S4, sedang)*
5. **Security headers** via `next.config.ts` (CSP, X-Frame-Options, Referrer-Policy, HSTS). *(S5, kecil)*
6. **Standarisasi error handling** — semua action pakai `.safeParse()` + pola `?error=` yang seragam sehingga validasi gagal jadi toast, bukan 500. *(F1, sedang)*

### Fase 2 — Keandalan lapangan (nilai tertinggi untuk pemakaian hari-H)

7. **PWA + offline-first** — service worker, cache halaman produk/floor map/circle event aktif agar tetap terbuka saat sinyal jelek; "Add to Home Screen". *(besar, tapi ini pembeda utama)*
8. **Mode checklist event** — tampilan mobile ringan untuk mencentang item saat sudah dibeli (update status cepat), dengan optimistic UI. *(sedang)*
9. **Floor map interaktif** — pinch-zoom & pan di HP, highlight booth target, "next booth" untuk rute belanja. *(sedang)*

### Fase 3 — UI/UX polish

10. Skeleton loading konsisten (`loading.tsx` per route), empty state seragam, breadcrumb.
11. Aksesibilitas: alt text bermakna pada gambar produk/banner, focus ring, `aria-label` pada tombol ikon, kontras warna dicek.
12. Dark mode (token warna sudah ada, tinggal varian).
13. Konsistensi bahasa UI (pilih ID atau EN, kini campur).

### Fase 4 — Fitur baru

14. **Upload gambar produk** (kini hanya URL) via Vercel Blob — reuse `lib/blob.ts` yang sudah ada. *(kecil)*
15. **Notifikasi/pengingat deadline PO** (email atau in-app badge). *(sedang)*
16. **Budget per kategori** + peringatan saat mendekati/melewati batas. *(sedang)*
17. **Import/export CSV** produk & expense untuk backup/migrasi. *(sedang)*
18. **Analitik lintas-event** — perbandingan spend antar event, tren per kategori. *(sedang)*
19. **Opsi proteksi halaman publik** — mode privat sederhana (mis. gerbang password) untuk sembunyikan data budget. *(S6, kecil–sedang)*

### Fase 5 — Kualitas & DevOps (menopang semua di atas)

20. Setup **Vitest** (unit untuk validators/format/queries) + **Playwright** (smoke: login, CRUD produk, dashboard). *(F2)*
21. **GitHub Actions CI**: lint + typecheck + build + test tiap PR. *(F2)*
22. Commit ulang `drizzle/meta`, samakan `bodySizeLimit`↔limit blob, bersihkan README. *(F3, F4, F5)*

---

## Saran urutan eksekusi

- **Sprint 1 (cepat, dampak tinggi):** Fase 1 poin 1–2 & 5–6 + Fase 5 poin 22 → tutup celah keamanan yang jelas dan rapikan error handling dalam satu batch kecil.
- **Sprint 2:** Fase 5 poin 20–21 (test + CI) → jaring pengaman sebelum menambah fitur besar.
- **Sprint 3+:** Fase 2 (offline/checklist/map) → nilai nyata terbesar untuk cara aplikasi ini dipakai.

---

## Catatan setup database

Codebase ini **PostgreSQL-only** pada kondisi saat ini:

- `db/schema.ts` memakai `drizzle-orm/pg-core` (`pgTable`, `pgEnum`, `uuid().defaultRandom()`).
- `db/client.ts` memakai driver `postgres` (postgres.js) + penanganan koneksi khusus Neon.
- `drizzle.config.ts` dialect Postgres; migrasi di `drizzle/*.sql` bersintaks Postgres.

Untuk menjalankan dengan database MySQL `comipocket`, dibutuhkan migrasi lapisan data ke
MySQL (schema → `mysql-core`, driver → `mysql2`, penyesuaian `uuid`/`enum`, dan tulis ulang
migrasi). Alternatifnya adalah menyediakan PostgreSQL lokal agar codebase tetap utuh.
Keputusan ini menentukan langkah setup lokal.
