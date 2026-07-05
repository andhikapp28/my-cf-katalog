# Evaluasi Produk — Dipa Katalog
**Ditulis oleh**: Alex (PM) · **Tanggal**: 2026-07-05 · **Konteks**: evaluasi menyeluruh pasca Sprint 1–3, sebelum commit/push Sprint 2 & 3

---

## 1. Ringkasan Eksekutif

Dipa Katalog sudah jauh lebih matang dari "aplikasi personal yang rapi" menjadi produk dengan disiplin rekayasa yang sungguh-sungguh: validasi konsisten, security headers, test suite (94 unit + E2E), CI, dan — yang paling relevan untuk tujuan intinya — sudah punya PWA offline-first, floor map interaktif, dan mode checklist yang secara spesifik dirancang untuk kondisi pemakaian nyata di venue (jalan/berdiri, sinyal jelek, tap cepat berulang).

Tapi ada **satu kesenjangan fatal** antara "sudah dibangun" dan "aman dipakai hari-H": sebagian besar Server Action (yaitu SEMUA CRUD selain checklist) masih memakai pola yang TERBUKTI macet permanen di build produksi sungguhan. Aplikasi ini secara arsitektur SUDAH SIAP untuk pemakaian offline-tolerant, tapi jalur admin (tempat kamu benar-benar mencatat pembelian, menghapus produk salah input, menambah expense di tempat) berisiko besar hang total kalau dijalankan lewat `next start` — dan ini belum diverifikasi apakah Vercel juga kena.

Posisi saat ini: **fondasi keamanan & keandalan lapangan sudah kuat secara desain, tapi ada satu bug arsitektural belum tuntas yang bisa membuat momen paling penting (hari-H, hands-on venue) justru menjadi momen paling rapuh.** Prioritas mutlak sebelum event nyata berikutnya adalah menutup celah ini — bukan menambah fitur baru.

---

## 2. Apa yang Sudah Kuat

Beberapa hal ini pantas diapresiasi secara spesifik, bukan basa-basi:

- **Mode checklist (`/admin/checklist` + `ChecklistItemCard`) adalah desain yang benar secara arsitektur, bukan cuma UI bagus.** Pemilihan `useOptimistic` + `useActionState`-style call (tanpa `redirect()` sama sekali) BUKAN kebetulan — itu justru satu-satunya bagian aplikasi yang sudah dibuktikan aman dari bug hang produksi. Tombol undo yang tetap hidup berdampingan dengan aksi utama (bukan menggantikannya) menunjukkan pemikiran soal alur nyata: tap "Buka PO" lalu langsung "Tandai dibeli" tanpa harus undo dulu.
- **`lib/floor-map.ts` — `pickNextBooth` dan `computeFocalTranslate` ditulis dengan penjelasan keputusan desain di komentar, bukan cuma kode.** Wrap-around next-booth dan zoom-around-focal-point adalah detail kecil yang biasanya diabaikan tapi justru krusial dipakai satu tangan sambil jalan.
- **Service worker hand-rolled di `public/sw.js` adalah keputusan yang tepat untuk konteks ini**, dan alasan penolakan `next-pwa` (histori kompatibilitas buruk dengan App Router) didokumentasikan dengan jujur, bukan asumsi. Cache-first untuk asset statis + stale-while-revalidate untuk gambar cross-origin (banner/produk dari URL bebas) menunjukkan pemahaman bahwa "offline" di aplikasi ini bukan cuma soal file JS, tapi soal foto produk yang harus tetap kelihatan saat sinyal mati di tengah hall.
- **Pemisahan tegas admin (tidak pernah di-cache SW) vs publik (di-cache)** adalah trade-off yang benar: mutasi tidak boleh silently stale, tapi katalog untuk dilihat-lihat harus tetap terbuka offline.
- **Dokumentasi bug di kode itu sendiri** (komentar panjang di `actions/products.ts` dan `playwright.config.ts`) adalah praktik yang jarang ditemukan di proyek solo — bug arsitektural yang rumit ini dijelaskan lengkap dengan bukti reproduksi (curl vs browser, waktu respons), bukan cuma "known issue" satu baris. Ini investasi pengetahuan yang akan sangat berharga kalau nanti debugging ulang diperlukan.
- **Keamanan dasar (Sprint 1) benar-benar menutup celah nyata**, bukan checklist kosong: `remotePatterns` dipersempit dari wildcard total ke host tepercaya adalah perbaikan SSRF yang konkret, dan CSP + HSTS + `frame-ancestors 'none'` adalah baseline yang jarang ada di proyek personal skala ini.
- **Keputusan untuk TIDAK memakai Next 15.1.6** meski itu "memperbaiki" bug hang, karena ada CVE kritis, menunjukkan disiplin trade-off yang benar — bukan sekadar mencari jalan pintas yang bikin test hijau.

---

## 3. Risiko Terbesar — HARUS Diselesaikan Sebelum Dipakai di Event Nyata

### 3.1 Bug hang produksi residual pada hampir semua Server Action CRUD

**Fakta dari kode** (saya verifikasi langsung, bukan cuma dari ringkasan): pola `redirect()` pasca-mutasi masih dipakai di:
- `upsertProductAction`, `deleteProductAction`, `deleteProductImageAction` (`actions/products.ts`)
- `upsertEventAction`, `deleteEventAction` (`actions/events.ts`)
- `addCatalogEntryAction` (`actions/catalog.ts`) — **termasuk form "Quick Catalog" yang justru jadi alur utama untuk menambah circle+booth+produk sekaligus**
- Dan secara pola yang sama nyaris pasti berlaku juga untuk circles, floor-maps, booths, expenses (mengikuti struktur identik ke `events.ts`/`products.ts`)
- `requireAdmin()` sendiri (`lib/auth.ts`) memanggil `redirect("/admin/login")` — kalau ini terpanggil DARI DALAM sebuah Server Action (mis. sesi kedaluwarsa saat submit), jalur redirect itu juga lewat mekanisme Server Action, bukan navigasi halaman biasa.

**Hanya** `quickUpdateProductStatusAction` (checklist), `addCatalogEntryAction`... *koreksi*: `addCatalogEntryAction` MASIH pakai `redirect()` di akhir (baris terakhir `redirect("/admin/products?success=catalog-entry-saved")`) — jadi form Quick Catalog **BELUM** aman, meski state error-nya sudah pakai `useActionState`. Yang benar-benar sudah tervalidasi aman hanyalah `quickUpdateProductStatusAction` dan `authenticate` (login, karena tidak redirect manual — `signIn()` menangani redirect secara internal lewat mekanisme next-auth, dan itu jalur berbeda dari `redirect()` manual).

**Dampak nyata dalam bahasa pengguna**: kalau Sprint 2–3 di-deploy sebagai `next start` di server sendiri (self-hosted, bukan Vercel) — yang menurut komentar `auth.config.ts` sepertinya memang skenario yang dituju (`trustHost: true` khusus ditulis untuk kasus "self-hosted... bukan Vercel") — maka saat di venue kamu:
- Tap "Simpan" di form edit produk → form macet di state pending, tidak pernah pindah, walau di database perubahan SUDAH tersimpan. Kamu tidak tahu apakah harus tunggu, refresh, atau submit ulang (yang berisiko duplikat kalau itu insert, bukan update).
- Tap "Hapus" produk yang salah masuk → sama, macet tanpa kepastian apakah terhapus.
- Submit form "Quick Catalog" (alur utama menambah temuan booth baru circle) di venue → macet, padahal ini justru fitur yang paling sering dipakai saat baru sampai di venue dan mendata circle/booth on the spot.
- Satu-satunya alur yang **terbukti aman** untuk tap cepat berulang saat jalan adalah checklist status update. Semua CRUD "berat" (tambah produk baru, edit, hapus, tambah expense, atur event) berisiko macet total.

**Ketidakpastian penting yang harus digarisbawahi**: ada kontradiksi kecil antara dua sumber di kode itu sendiri. Komentar di `playwright.config.ts` (ditulis Sprint 2) menyatakan bug HANYA terjadi pada redirect ke **pathname yang sama**, dan redirect ke pathname berbeda (login → admin) "tidak kena bug ini". Tapi ringkasan Sprint 3 (setelah diagnostik lanjutan) menyatakan bug **juga** terjadi pada redirect ke pathname berbeda — lebih luas dari dugaan awal. Komentar `playwright.config.ts` belum diperbarui untuk mencerminkan temuan Sprint 3 ini. Artinya: bahkan alur LOGIN pun (redirect pathname beda: `/admin/login` → `/admin`) mungkin tidak seaman yang didokumentasikan tertulis — ini sendiri perlu diverifikasi ulang sebelum dianggap aman, karena kalau login pun macet, aplikasi ini benar-benar tidak bisa dipakai sama sekali di production build self-hosted.

**Rekomendasi, dengan trade-off eksplisit:**

| Opsi | Effort | Kepastian | Catatan |
|------|--------|-----------|---------|
| **A. Migrasi semua Server Action CRUD ke pola `useActionState` (tanpa redirect)** seperti `quickUpdateProductStatusAction` | Sedang — ~8-10 action, pola sudah ada sebagai template, plus perlu ubah semua form caller jadi client component dengan `useActionState`/toast manual | **Tinggi** — satu-satunya opsi yang sudah TERBUKTI bekerja di build produksi sungguhan kamu sendiri | Rekomendasi utama saya. Effort riil tapi bounded (bukan riset baru, tinggal replikasi pola yang sudah divalidasi) |
| **B. Deploy ke Vercel dan anggap bug ini tidak relevan** karena runtime serverless Vercel berbeda dari `next start` | Sangat kecil (tidak ada perubahan kode) | **RENDAH — INI ASUMSI BELUM DIVERIFIKASI.** Kamu belum pernah menguji ini di Vercel sungguhan. | Jangan jadikan ini keputusan default. Kalau kamu memang berniat deploy ke Vercel, **verifikasi dulu** dengan deploy preview + reproduksi manual submit form edit/hapus produk di preview Vercel SEBELUM event nyata berikutnya — jangan asumsikan aman hanya karena arsitektur "kelihatannya beda" |
| **C. Downgrade ke Next 15.1.6** | Kecil | Tinggi untuk bug ini, tapi **membuka CVE kritis** (CVE-2025-66478) | Sudah benar ditolak Sprint 3. Jangan diambil. |
| **D. Mitigasi sementara: ganti semua form admin krusial (produk, expense) jadi pola "submit lalu manual refresh"** — mis. tetap pakai `redirect()` tapi UI menampilkan pesan "Jika macet >5 detik, refresh manual, data kemungkinan sudah tersimpan" | Sangat kecil | Rendah — band-aid, bukan fix, dan berisiko duplikat submit di form insert | Hanya sebagai jembatan darurat kalau opsi A tidak sempat selesai sebelum event terdekat. TIDAK direkomendasikan sebagai solusi permanen. |

**Rekomendasi saya: Opsi A, dikerjakan sebelum event nyata berikutnya, dimulai dari `deleteProductAction` dan `upsertProductAction` (paling sering dipakai saat mendata di venue) dan `addCatalogEntryAction` (Quick Catalog).** Kalau ada tekanan waktu dan event sudah dekat, minimal migrasikan action yang paling mungkin dipakai LANGSUNG di venue (produk, expense) — action admin murni backoffice (events, floor maps, circles setup) biasanya dikerjakan dari rumah dengan koneksi stabil dan risikonya lebih bisa ditoleransi untuk sementara.

Saya di confidence ~85% bahwa opsi A adalah langkah yang benar — bukan 100% karena saya belum menguji sendiri apakah migrasi ini 100% bebas efek samping di semua form (terutama Quick Catalog yang punya payload JSON kompleks), tapi pola dasarnya sudah divalidasi bekerja.

### 3.2 Halaman publik (termasuk data finansial) benar-benar terbuka tanpa proteksi (S6)

Ini bukan bug baru, tapi worth menaikkan urgensinya: `/expenses`, dashboard budget, dan detail produk dengan harga semuanya bisa diakses siapa pun yang tahu/menebak URL — tanpa auth. Untuk aplikasi personal ini mungkin diterima secara sadar, tapi kalau kamu berencana share link floor map/produk ke teman (yang menurut desain "next booth"/checklist memang terasa seperti dirancang untuk dipakai bareng saat di venue), orang itu otomatis juga bisa melihat total budget dan pengeluaran pribadimu. Ini keputusan produk yang butuh konfirmasi eksplisit darimu (lihat pertanyaan #2 di bagian 5), bukan hal yang saya asumsikan salah.

### 3.3 Rate limiting login (S3) masih belum ada

Risiko lebih rendah untuk aplikasi single-user dengan traffic kecil, tapi kalau URL admin diketahui publik (karena app-nya sendiri publik), brute-force password tetap mungkin. Effort kecil, bukan blocker hari-H, tapi murah untuk dikerjakan sekalian saat menyentuh `auth.ts` untuk hal lain.

---

## 4. Rekomendasi Roadmap Berikutnya, Terprioritas

Konteks yang saya pegang: ini produk personal, tidak butuh skala, tapi HARUS andal di hari-H. Saya susun ulang — bukan sekadar salin Fase 3/4 dari PLAN.md — berdasarkan rasio effort vs value untuk *pemakaian nyata di venue*, bukan kelengkapan fitur generik.

**Prioritas 0 (blocker, sebelum event nyata berikutnya):**
1. **Migrasi Server Action CRUD tersisa ke pola `useActionState`** (bagian 3.1). Ini bukan "nice to have", ini syarat aplikasi bisa dipakai sama sekali secara aman di deployment self-hosted.
2. **Verifikasi perilaku di Vercel** (kalau itu opsi deploy yang dipertimbangkan) — deploy preview, coba submit form edit/hapus produk sungguhan, catat hasilnya. Ini 30 menit kerja yang menentukan apakah #1 mendesak atau bisa sedikit ditunda.
3. **Commit & push Sprint 2 dan Sprint 3** — saat ini semua pekerjaan besar (test suite, CI, PWA, checklist, floor map) ada di working directory tapi belum masuk git. Kalau laptop bermasalah sebelum event, semua ini hilang. Ini murni higienis tapi berisiko besar kalau diabaikan — should be near-zero effort, lakukan segera setelah #1 selesai (atau bahkan sebelumnya, dengan commit terpisah, supaya progress tidak menggantung).

**Prioritas 1 (quick win yang menurut saya terlewat dari PLAN.md, effort kecil-sedang, value tinggi untuk hari-H):**
4. **Indikator online/offline eksplisit di UI** (bukan cuma SW yang bekerja diam-diam). Toast kecil "Kamu sedang offline — data terakhir yang tersimpan" saat `navigator.onLine === false` akan sangat membantu kepercayaan diri pas sinyal jelek di venue — user tahu app-nya bukan rusak, cuma offline. Ini beda dari task besar "PWA" yang sudah selesai; ini polish kecil di atasnya yang saya nilai terlewat.
5. **"Undo" pada `deleteProductAction`** (soft-delete sementara / grace period), bukan hard delete langsung. Konteks: tap "Hapus" sambil jalan itu rawan salah pencet (layar kecil, jempol, buru-buru). Effort kecil (tambah kolom `deletedAt` atau simpan snapshot sesaat), value besar untuk mengurangi kepanikan hari-H akibat salah hapus permanen.
6. **Precache eksplisit data event aktif ke IndexedDB/cache saat online** (bukan hanya bergantung pada kunjungan halaman sebelumnya untuk mengisi SW cache). Risiko saat ini: kalau kamu baru buka `/products/[id]` untuk produk tertentu SEKALI saat online sebelum berangkat, itu ter-cache. Tapi kalau ada produk yang belum pernah dibuka sebelum sinyal hilang, itu tidak ter-cache. Rekomendasi: tambahkan tombol/rutin "Siapkan offline" yang secara eksplisit melakukan prefetch semua halaman produk/circle/map untuk event aktif sebelum berangkat ke venue.

**Prioritas 2 (setelah P0 & quick win, sebelum menambah fitur baru besar):**
7. Rate limiting login (S3) — kecil, sekalian saat menyentuh `auth.ts`.
8. Opsi proteksi halaman publik (S6) — tergantung keputusan pemilik (lihat pertanyaan #2).
9. Upload gambar produk langsung (Fase 4 poin 14) — `lib/blob.ts` sudah ada, reuse-nya kecil, dan ini value nyata dibanding ketik URL manual saat mendata cepat di venue (foto langsung dari HP jauh lebih cepat daripada cari/copy URL gambar).

**Prioritas 3 (nilai nyata tapi tidak mendesak untuk hari-H, boleh menyusul):**
10. Dark mode, skeleton loading, aksesibilitas, konsistensi bahasa UI — semua valid tapi tidak mempengaruhi keandalan saat event. Saya akan menahan ini sampai P0–P2 selesai.
11. Notifikasi deadline PO, budget per kategori, import/export CSV, analitik lintas-event — fitur "di rumah", bukan "di venue". Tidak ada urgensi terkait konteks utama produk ini.
12. Refactor `getDashboardData` (agregasi di memori/F6) — utang teknis valid tapi di skala data personal saat ini (event tunggal, puluhan-ratusan produk) dampaknya nyaris nol. Jangan dikerjakan sampai benar-benar terasa lambat.

**Yang saya SENGAJA tidak masukkan sebagai prioritas** meski ada di PLAN.md: pemisahan library floor-map jadi lebih besar/generic, atau investasi besar ke arah multi-tenant apa pun. Produk ini personal — jangan biarkan roadmap tergoda ke arah "platform-ready" yang tidak dibutuhkan.

---

## 5. Pertanyaan Terbuka untuk Pemilik Produk

Ini keputusan yang butuh kamu, bukan saya, yang putuskan — karena menyangkut preferensi pribadi/operasional, bukan cuma teknis:

1. **Rencana deploy: self-hosted (`next start`) atau Vercel?** Ini menentukan urgensi P0.1 (migrasi Server Action). Kalau targetnya Vercel dan bug ini terbukti tidak terjadi di sana (setelah diverifikasi, bukan diasumsikan), tekanan waktu untuk migrasi besar-besaran bisa dikurangi jadi "baiknya dikerjakan" bukan "wajib sebelum event".
2. **Apakah halaman publik (termasuk `/expenses` dan detail budget) memang boleh dilihat siapa pun yang tahu URL?** Kalau kamu berencana share link produk/floor map ke teman saat di venue, apakah kamu keberatan mereka juga bisa lihat total budget/expense kamu? Kalau tidak masalah, S6 bisa didefer terus. Kalau masalah, ini naik prioritas.
3. **Seberapa dekat event nyata berikutnya?** Kalau ada event dalam beberapa minggu ke depan, saya akan mendesak P0 selesai duluan secara ketat sebelum menyentuh apa pun di P1/P2. Kalau event masih jauh (bulan), ada ruang untuk mengerjakan P0 dan beberapa quick win P1 sekaligus dengan lebih tenang.
4. **Apakah kamu benar-benar akan berbagi checklist/floor map dengan teman saat di venue** (device lain, bukan cuma kamu)? Ini mempengaruhi apakah item #2 di bagian 3 (proteksi publik) dan konsep "multi-device same session" perlu dipikirkan, atau tetap murni single-device single-user seperti asumsi awal.
5. **Untuk migrasi Server Action (P0.1): apakah kamu ingin saya (atau agen coding berikutnya) mengerjakan semua sekaligus dalam satu batch, atau bertahap per area (produk dulu, baru event/circle/expense)?** Effort besar sekaligus punya risiko regresi lebih tinggi untuk diuji sekali jalan; bertahap lebih aman untuk diverifikasi satu-satu tapi makan waktu kalender lebih panjang.

---

*File referensi yang dibaca untuk evaluasi ini: `PLAN.md`, `README.md`, `db/schema.ts`, `db/queries.ts`, `actions/products.ts`, `actions/events.ts`, `actions/auth.ts`, `actions/catalog.ts`, `playwright.config.ts`, `package.json`, `next.config.ts`, `auth.ts`, `auth.config.ts`, `middleware.ts`, `lib/auth.ts`, `lib/checklist.ts`, `lib/floor-map.ts`, `app/admin/checklist/page.tsx`, `components/checklist/checklist-item-card.tsx`, `public/manifest.json`, `public/sw.js`, `.github/workflows/ci.yml`.*
