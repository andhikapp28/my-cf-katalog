# Referensi Data Resmi & Panduan Event Comic Frontier (CF 16 – CF 23)

> **Status Dokumen:** Terverifikasi & Siap Digunakan untuk Sinkronisasi Data Web  
> **Sumber Validasi:** Situs Resmi Comifuro (*comifuro.net*), Platform Tiket Resmi (*Ticket2u.id* & *KiosTix*), Pengelola Venue (*ICE Indonesia*), Partner Resmi (*Bushiroad Group*, *Cover Corp / hololive ID*, *KAI Commuter*), serta Basis Data Industri (*Otabase*, *KAORI Nusantara*).

Dokumen ini disusun sebagai sumber kebenaran data (*single source of truth*) untuk merapikan master data event pada database, seed script (`db/seed.ts`), banner visual, serta antarmuka web katalog event Comic Frontier.

---

## 1. Tabel Rangkuman Eksekutif (CF 16 – CF 23)

| Edisi | Slug | Tanggal Resmi | Lokasi & Hall | Estimasi Pengunjung | Estimasi Circle | Platform & Harga Tiket | Highlight Utama |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CF 16** | `cf16` | **6 – 7 Mei 2023** | ICE BSD (Hall 8, 9, 10) | ± 42.000 – 45.000 | ~800 – 1.000 | KiosTix<br>• Reg: Rp 65.000<br>• Bundle: Rp 115.000 | • Ekspansi ke 3 hall pasca-evaluasi CF 15<br>• Virtual Meet & Greet hololive ID (Kobo, Ollie, Reine, Risu)<br>• Terakhir kali ada loket OTS tunai (5.000 tiket) |
| **CF 17** | `cf17` | **16 – 17 Des 2023** | ICE BSD (Hall 7, 8, 9, 10) | ± 50.000 | > 1.000 | Ticket2U<br>• Reg: Rp 65.000<br>• Bundle: Rp 120.000 | • Peluncuran perdana **Shuttle Bus Gratis Lorena** (St. Cisauk ↔ ICE)<br>• Ekspansi 4 hall penuh<br>• **100% Online Ticketing** (loket tunai fisik resmi dihapus) |
| **CF 18** | `cf18` | **11 – 12 Mei 2024** | ICE BSD (Hall 7, 8, 9, 10)<br>*(+ Hall 6 F&B/Rest)* | ± 45.000 – 50.000 | > 1.000 | Ticket2U<br>• Reg: Rp 75.000<br>• Bundle: Rp 130.000 | • **Bushiroad EXPO 2024** dibuka langsung CEO Takaaki Kidani<br>• Guest Seiyuu *BanG Dream!* (Aina Aiba & Yuka Nishio)<br>• Hall 6 terdedikasi untuk F&B & area istirahat |
| **CF 19** | `cf19` | **9 – 10 Nov 2024** | ICE BSD (Hall 7, 8, 9, 10) | ± 50.000 | > 1.000 | Ticket2U<br>• Reg: Rp 75.000<br>• Bundle: Rp 130.000 | • Konser anisong **Konomi Suzuki** & **Yuko Suzuhana** (Wagakki Band) x Upiko<br>• Digelar paralel di akhir pekan yang sama dengan ICC 2024 di JCC |
| **CF 20** | `cf20` | **24 – 25 Mei 2025** | ICE BSD (Hall 6, 7, 8, 9, 10) | ± 45.000 – 50.000 | > 1.000 – 1.200 | Ticket2U<br>• Reg: Rp 75.000<br>• Bundle: Rp 130.000 | • Edisi khusus angka Romawi **"CF XX"** (dua dekade perhelatan)<br>• **Bushiroad EXPO 2025** (Q&A Takaaki Kidani, seiyuu Yuka Nishio & Yuzuki Watase)<br>• Talkshow animasi bersama *Jiva Animation* |
| **CF 21** | `cf21` | **15 – 16 Nov 2025** | ICE BSD (Hall 6, 7, 8, 9, 10) | **70.000** *(Rekor Tertinggi)* | 1.300 – 1.500 | Ticket2U<br>• Reg: Rp 75.000<br>• Bundle: Rp 130.000 | • Konser akbar **hololive ID 5th Anniv LIVE "Chromatic Future"** (Hall 6)<br>• hololive ID Fan Fest di Hall 10<br>• Guest LN Author **Sunsunsun** (*Roshidere*)<br>• Pameran *Sky: Children of the Light* |
| **CF 22** | `cf22` | **16 – 17 Mei 2026** | ICE BSD (Hall 6, 7, 8, 9, 10) | ± 55.000 – 65.000 | 1.300 – 1.500+ | Ticket2U<br>• Reg: Rp 75.000<br>• Bundle: Rp 130.000 | • **Bushiroad EXPO 2026 Jakarta** (Tur Global Resmi)<br>• Kolaborasi resmi **KAI Commuter** (Kartu Multi Trip eksklusif CF 22)<br>• Key Visual Art oleh ilustrator *@ichigowarano* |
| **CF 23** | `cf23` | **31 Okt – 1 Nov 2026** | ICE BSD (Hall 6 – 10)<br>*(+ Hall 5 Komunitas)* | ± 60.000 – 70.000 | 1.500+ Terkurasi | Ticket2U<br>• 100% Online | • Edisi tematik **Halloween Weekend**<br>• Sistem seleksi circle 100% kurasi komite (*strict committee screening*)<br>• Penyediaan area *Free Community Booths* di Hall 5 |

---

## 2. Catatan Audit Data Database (`db/seed.ts`)

Saat membandingkan data aktual dengan data seed awal di project, ditemukan beberapa pergeseran (*data shift*) historis:

1. **CF 16 (`cf16`):**
   * *Data Seed Lama:* 28–29 Maret 2020 (ini merupakan arsip awal masa awal pandemi COVID-19).
   * *Data Faktual Valid:* **6 – 7 Mei 2023** di ICE BSD Hall 8, 9, 10.
2. **CF 17 (`cf17`):**
   * *Data Seed Lama:* 27–28 Maret 2021.
   * *Data Faktual Valid:* **16 – 17 Desember 2023** di ICE BSD Hall 7, 8, 9, 10.
3. **CF 18 (`cf18`):**
   * *Data Seed Lama:* "Online Virtual Edition" 17–18 Juli 2021 (data ini sebenarnya milik *Comic Frontier Virtual / Comivuro 1*).
   * *Data Faktual Valid:* **11 – 12 Mei 2024** di ICE BSD Hall 6, 7, 8, 9, 10.
4. **CF 19 (`cf19`):**
   * *Data Seed Lama:* 24–25 September 2022 (data ini sebenarnya milik *Comifuro 15 offline return*).
   * *Data Faktual Valid:* **9 – 10 November 2024** di ICE BSD Hall 7, 8, 9, 10.
5. **CF 20 (`cf20`):**
   * *Data Seed Lama:* 11–12 Maret 2023.
   * *Data Faktual Valid:* **24 – 25 Mei 2025** di ICE BSD Hall 6, 7, 8, 9, 10 (Comic Frontier XX).
6. **CF 21 (`cf21`):**
   * *Data Seed Lama:* 16–17 Desember 2023.
   * *Data Faktual Valid:* **15 – 16 November 2025** di ICE BSD Hall 6, 7, 8, 9, 10.
7. **CF 22 (`cf22`):**
   * *Data Seed Lama:* 11–12 Mei 2024.
   * *Data Faktual Valid:* **16 – 17 Mei 2026** di ICE BSD Hall 6, 7, 8, 9, 10.
8. **CF 23 (`cf23`):**
   * *Data Seed Lama:* 31 Oktober – 1 November 2026. (Sudah tepat).

---

## 3. Detail Mendalam Tiap Edisi

### A. Comic Frontier 16 (CF 16)
* **Tanggal:** 6 – 7 Mei 2023 *(diundur dari jadwal awal 11–12 Maret 2023 demi penyempurnaan alur keamanan)*.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 8, 9, dan 10**.
* **Karakteristik & Ekosistem:**
  * Penambahan Hall 8 memperluas daya tampung sirkulasi pengunjung dan circle secara signifikan.
  * Menghadirkan sesi virtual *Meet & Greet* eksklusif bersama talenta hololive Indonesia (Pavolia Reine, Ayunda Risu, Kureiji Ollie, Kobo Kanaeru) dengan sistem tiket *raffle* khusus seharga Rp 450.000.
  * Stage hiburan diisi oleh kreator lokal, komunitas VTuber (MAHA5, hololive), serta sesi anisong/DJ party (Sergie Vergio, Komastar, Otagroove).
* **Sistem Tiket:** Dikelola oleh KiosTix. Tiket Reguler Rp 65.000, Tiket Bundle Merchandise Rp 115.000. Hari pertama mencatat penjualan 25.000 tiket (20.000 online via 16 booth penukaran dan 5.000 tiket On-The-Spot tunai).

### B. Comic Frontier 17 (CF 17)
* **Tanggal:** 16 – 17 Desember 2023.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 7, 8, 9, dan 10** (ekspansi 4 hall).
* **Inovasi Operasional:**
  * **Shuttle Bus Gratis Lorena:** Panitia Comifuro menyewa dan menyediakan armada shuttle bus gratis yang dioperasikan oleh PT Eka Sari Lorena Transport Tbk, beroperasi bolak-balik menghubungkan Stasiun Cisauk / Terminal Intermoda BSD langsung ke Outdoor Parking Hall 10 ICE BSD.
  * **Sistem Scan Ticket2U:** Menggandeng Ticket2u untuk sistem check-in barcode cepat. Antrean penukaran gelang terurai jauh lebih cepat (hari ke-1 rampung pukul 11:30 WIB; hari ke-2 pukul 10:30 WIB).
  * **Penghapusan Loket Tunai:** Pembelian On-The-Spot fisik ditutup total; pengunjung hari-H wajib membeli tiket daring di Ticket2u.
* **Sistem Tiket:** Ticket2U. Tiket Reguler Rp 65.000 (+ platform fee Rp 6.000 = Rp 71.000). Tiket Bundle Merchandise Rp 120.000 (include tote bag, poster, paper fan).

### C. Comic Frontier 18 (CF 18)
* **Tanggal:** 11 – 12 Mei 2024.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 7, 8, 9, 10** *(+ Hall 6 untuk F&B)*.
  * *Hall 10:* Pintu masuk utama, Corporate Booths, Indoor Cosplay Area.
  * *Hall 8 & 9:* Circle Market (kreator independen).
  * *Hall 7:* Main Stage, Ruang Ganti Cosplay, Penitipan Barang (*Baggage Drop*).
  * *Hall 6:* Zona Makanan & Minuman (F&B) berkapasitas besar dan area istirahat.
  * *Outdoor:* Taman depan Hall 7–10 & Loading Dock Hall 9 sebagai Outdoor Cosplay Area.
* **Highlight & Tamu Internasional:**
  * **Bushiroad EXPO 2024:** Diadakan terintegrasi langsung di dalam CF 18.
  * Dibuka langsung oleh CEO Bushiroad Group, **Takaaki Kidani**, dalam bahasa Jepang di Main Stage pada kedua hari.
  * Menghadirkan seiyuu ternama *BanG Dream!*: **Aina Aiba** (Yukina Minato / Roselia) dan **Yuka Nishio** (Nanami Hiromachi / Morfonica), serta ilustrator TCG *Cardfight!! Vanguard*, **Hisashi Momose**.
  * Fasilitas donor darah bekerja sama dengan PMI di ticketing counter Hall 8.
* **Sistem Tiket:** Ticket2U. Tiket Reguler Rp 75.000, Tiket Bundle Rp 130.000.

### D. Comic Frontier 19 (CF 19)
* **Tanggal:** 9 – 10 November 2024.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 7, 8, 9, dan 10**.
  * *Catatan Venue:* Bersamaan dengan akhir pekan pelaksanaan Indonesia Comic Con (ICC) 2024 yang bertempat di JCC Senayan Jakarta, Comic Frontier 19 tetap berjalan independen di ICE BSD City.
* **Highlight & Konser Khusus:**
  * **Anisong Live Stage (Day 1 - 9 Nov 2024):** Konser musik anisong oleh penyanyi papan atas Jepang, **Konomi Suzuki** (vokalis lagu tema *No Game No Life*, *Re:Zero*, *Sakurasou no Pet Kanojo*).
  * **Jewel Box Music Stage (Day 2 - 10 Nov 2024):** Konser kolaboratif vokalis utama Wagakki Band, **Yuko Suzuhana**, didampingi master instrumen tradisional Jepang Daisuke Kaminaga (shakuhachi), Taichi Hikida (shamisen), dan musisi indie Jepang **Upiko**.
* **Sistem Tiket:** Ticket2U. Tiket Masuk Reguler Rp 75.000, Tiket Bundle Rp 130.000. Tiket konser dijual terpisah (Rp 500.000/hari atau paket 2 hari Rp 950.000).

### E. Comic Frontier 20 (Comic Frontier XX)
* **Tanggal:** 24 – 25 Mei 2025.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 6, 7, 8, 9, dan 10** (5 Hall penuh).
* **Highlight:**
  * Penamaan edisi khusus angka Romawi **"CF XX"** untuk menandai perayaan edisi ke-20.
  * **Bushiroad EXPO 2025:** Menghadirkan sesi Q&A dwibahasa bersama CEO Takaaki Kidani, seiyuu *BanG Dream!* (Yuka Nishio & Yuzuki Watase), serta sesi tanda tangan ilustrator *NOMISAKI*.
  * Talkshow industri animasi nasional bersama *Jiva Animation*.
* **Sistem Tiket:** Ticket2U. Tiket Reguler Rp 75.000, Tiket Bundle Rp 130.000.

### F. Comic Frontier 21 (CF 21)
* **Tanggal:** 15 – 16 November 2025.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 6, 7, 8, 9, dan 10**.
* **Highlight:**
  * **Rekor Pengunjung:** Mencetak rekor tertinggi sepanjang sejarah Comifuro dengan **70.000 pengunjung**.
  * **hololive Indonesia 5th Anniversary LIVE "Chromatic Future":** Konser arena offline pertama yang menghadirkan seluruh 9 talenta hololive ID di Hall 6 pada 15 November 2025 (tiket konser *sold out*).
  * **hololive ID Fan Fest di Hall 10:** Area eksklusif interaktif, Meet & Greet, dan Stamp Rally.
  * Guest internasional: Penulis Light Novel kenamaan Jepang, **Sunsunsun** (*Roshidere / Alya Sometimes Hides Her Feelings in Russian*), bersama Phoenix Gramedia.
  * Pameran interaktif game *Sky: Children of the Light*.
* **Sistem Tiket:** Ticket2U. Tiket Masuk Pameran Rp 75.000, Tiket Bundle Rp 130.000.

### G. Comic Frontier 22 (CF 22)
* **Tanggal:** 16 – 17 Mei 2026.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 6, 7, 8, 9, dan 10**.
* **Highlight:**
  * **Bushiroad EXPO 2026 Jakarta:** Tur dunia resmi Bushiroad kembali hadir di Indonesia.
  * **Kolaborasi Resmi KAI Commuter:** Peluncuran Kartu Multi Trip (KMT) edisi koleksi terbatas bertema Comic Frontier 22 (3 varian desain eksklusif, seharga Rp 80.000 per kartu atau Rp 210.000 untuk paket bundling 3 kartu).
  * Kolaborasi kuliner & merchandise resmi bersama Amanda Brownies.
  * Poster resmi dirancang oleh ilustrator *@ichigowarano*.
* **Sistem Tiket:** Ticket2U. Tiket Reguler Rp 75.000, Tiket Bundle Rp 130.000.

### H. Comic Frontier 23 (CF 23)
* **Tanggal:** 31 Oktober – 1 November 2026.
* **Venue & Zonasi Hall:** ICE BSD City, **Hall 6 – 10** *(ditambah Hall 5 untuk Community Booths)*.
* **Highlight:**
  * Edisi tematik **Halloween Weekend**.
  * Seleksi Circle Market menerapkan sistem kurasi komite ketat (*strict committee screening*) demi menjamin orisinalitas karya dan bebas dari unsur AI-generated.
  * Penyediaan area **Community Booths Bebas Biaya** di Hall 5 untuk komunitas kreatif dan hobi.
* **Sistem Tiket:** Ticket2U (100% online).

---

## 4. Rules & Regulasi Resmi Acara

### A. Regulasi Circle & Hak Cipta Karya (*Terms of Service*)
1. **Larangan Generative AI:** Dilarang keras memajang atau memperjualbelikan karya/merchandise yang dihasilkan dari Artificial Intelligence (Generative AI). Circle yang melanggar akan langsung didiskualifikasi dan dikeluarkan dari venue tanpa pengembalian biaya meja (*no refund*).
2. **Larangan Bootleg & Reseller Barang Pabrikan:** Meja Circle dilarang bertindak sebagai reseller barang komersial pabrik (album CD resmi, poster berlisensi pabrikan, figure bajakan/counterfeit, merchandise resmi impor).
3. **Plagiarisme & Tracing:** Dilarang menjiplak, melakukan tracing, atau meniru komposisi artwork orang lain hingga menyerupai aslinya.
4. **Penggunaan Logo Resmi:** Dilarang menempelkan logo resmi atau merek dagang (*trademark*) waralaba komersial pada produk buatan sendiri.
5. **Larangan Konten Pornografi Terbuka & NFT:** Dilarang menjual karya bermuatan pornografi terbuka (melanggar UU Pornografi RI) serta dilarang memperdagangkan aset berbasis NFT/Web3.
6. **Spesifikasi Meja:** 1 Circle Space berukuran 90 cm x 45 cm, dilengkapi 2 kursi dan 2 Circle Pass per hari.

### B. Regulasi Cosplay & Properti Senjata (*Props Policy*)
1. **Bahan yang Diizinkan:** Properti senjata replika hanya boleh terbuat dari material yang aman dan ringan: **busa hati (EVA foam), plastik lunak, karton/kardus, PVC/ABS lunak, atau kayu ringan tumpul**.
2. **Bahan yang Dilarang Keras:**
   * Senjata tajam/runcing berbahan logam besi asli (pedang, pisau, belati, kunai logam).
   * Replika senjata api realistis (*airsoft gun*, senjata angin berpeluru, proyektil, busur panah dengan anak panah fungsional).
   * Bahan kimia beracun, petasan, kembang api, atau benda berbau menyengat/mudah terbakar.
   * *Barang yang melanggar akan disita sementara di pos keamanan gerbang masuk.*
3. **Etika Busana:**
   * Dilarang mengenakan seragam dinas aktif instansi militer atau kepolisian Indonesia (TNI / POLRI).
   * Dilarang mengenakan atribut atau simbol organisasi terlarang dan ujaran kebencian.
   * Kostum wajib mematuhi norma kesopanan umum (tidak mengekspos bagian sensitif tubuh secara berlebihan).
   * Berlaku prinsip **"Cosplay is Not Consent"**: wajib meminta izin secara sopan sebelum mengambil foto atau menyapa cosplayer.
4. **Zonasi Pemotretan Cosplay:** Sesi foto dan perekaman video dilarang dilakukan di lorong Circle Market (Hall 7, 8, 9) demi mencegah penumpukan massa. Area foto resmi dialokasikan di *Pre-function area Hall 6–10*, *Loading Dock belakang*, dan *Taman Outdoor*.

### C. Fasilitas Ruang Ganti & Penitipan Barang
1. **Larangan Berganti Pakaian di Toilet Umum:** Dilarang keras berganti pakaian, memakai wig, atau merias wajah di dalam toilet umum ICE BSD untuk mencegah antrean fasilitas sanitasi tersumbat.
2. **Ruang Ganti Resmi (*Changing Room*):** Disediakan khusus di Hall 6/7 dengan retribusi kebersihan **Rp 10.000 per orang/akses masuk**. Dilarang keras mengambil dokumentasi foto/video di dalam ruang ganti.
3. **Penitipan Barang (*Luggage Storage*):** Bertempat di Hall 6/7. Tarif penitipan: **Rp 10.000** untuk tas kecil/sedang (backpack, totebag) dan **Rp 20.000** untuk koper besar atau boks kontainer.

---

## 5. Panduan Akses Transportasi Menuju ICE BSD

```
[Stasiun Cisauk (KRL)] ──Jembatan Layang (Skywalk)──> [Terminal Intermoda BSD]
                                                             │
                         ┌───────────────────────────────────┴───────────────────────────────────┐
                         ▼                                                                       ▼
           [Shuttle Bus Gratis Comifuro (Lorena)]                                  [BSD Link Shuttle Gratis]
             (Rute: Intermoda ⇄ Hall 10 ICE BSD)                                    (Halte ICE 1 & ICE 2)
```

### A. Rute KRL Commuter Line & Shuttle Bus
1. **Rute KRL:** Naik KRL Lin Rangkasbitung (relasi Tanah Abang – Rangkasbitung), turun di **Stasiun Cisauk**.
2. **Skywalk Integrasi:** Berjalan kaki melalui jembatan layang pejalan kaki (*skybridge*) terintegrasi sepanjang ±250 meter menuju **Terminal Intermoda BSD City**.
3. **Shuttle Bus Gratis Comifuro (Lorena):**
   * **Rute:** Terminal Intermoda BSD ⇄ Drop-off Outdoor Parking Hall 10 ICE BSD City (PP).
   * **Tarif:** 100% **Gratis** tanpa syarat tiket untuk seluruh pengunjung, cosplayer, dan circle.
   * **Jam Operasional:** Pukul **07:00 – 20:00 / 21:30 WIB** (berangkat berkala setiap 15–30 menit).
4. **BSD Link Shuttle Bus:** Menggunakan bus kota gratis keliling BSD City dari Terminal Intermoda menuju halte *ICE 1* dan *ICE 2*.

### B. Akses Kendaraan Pribadi & Jalan Tol
1. **Tol Serpong – Balaraja (Serbaraja Seksi 1A):** Rute paling efisien; keluar di gerbang tol **BSD Barat / AEON Mall / ICE BSD**, berjarak hanya ±3 menit berkendara menuju lobi utama ICE BSD.
2. **Tol Jakarta – Serpong (JORR):** Keluar di gerbang tol **BSD City / Rawa Buntu**, kemudian menyusuri Jl. Kapten Soebijanto Djojohadikusumo / Jl. BSD Grand Boulevard (±15–20 menit).
3. **Kapasitas Parkir:** ICE BSD menyediakan area parkir basement dan outdoor berkapasitas hingga lebih dari **5.000 kendaraan**. Area parkir cadangan tersedia di AEON Mall BSD dan kawasan Edutown.

### C. Jam Operasional Masuk (*Gate Hours*)
* **Pembelian Tiket:** Wajib melalui platform daring **Ticket2U** (tidak ada loket tunai fisik di venue).
* **Mulai Penukaran Wristband (Gelang):** Pukul **08:00 WIB**.
* **Batas Akhir Penukaran Wristband:** Pukul **18:15 WIB**.
* **Pintu Masuk Ditutup (*Gate Close*):** Pukul **18:30 WIB**.
* **Ketentuan Anak:** Anak berusia **2 tahun ke atas** wajib memiliki tiket gelang sendiri.

---

## 6. Pemetaan Payload untuk Sinkronisasi `db/seed.ts`

Berikut adalah representasi objek TypeScript yang dapat langsung disematkan ke array `comifuroMasterEvents` pada `db/seed.ts`:

```typescript
export const comifuroMasterEvents = [
  {
    slug: "cf23",
    name: "Comic Frontier 23 (Comifuro 23)",
    description: "Edisi tematik Halloween Weekend di ICE BSD City dengan seleksi circle terkurasi ketat dan free community booth.",
    venue: "ICE BSD City (Hall 6 - 10 & Hall 5)",
    bannerImageUrl: "/banner/cf23.jpg",
    startsAt: new Date("2026-10-31T09:00:00+07:00"),
    endsAt: new Date("2026-11-01T18:00:00+07:00"),
    budget: 2500000,
    isActive: false
  },
  {
    slug: "cf22",
    name: "Comic Frontier 22 (Comifuro 22)",
    description: "1.500+ Circle kreator independen, Bushiroad EXPO 2026, kolaborasi resmi Kartu Multi Trip KAI Commuter, dan stage kreatif.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf22.jpg",
    startsAt: new Date("2026-05-16T09:00:00+07:00"),
    endsAt: new Date("2026-05-17T18:00:00+07:00"),
    budget: 2500000,
    isActive: true
  },
  {
    slug: "cf21",
    name: "Comic Frontier 21 (Comifuro 21)",
    description: "Edisi pemecah rekor 70.000 pengunjung dengan konser akbar hololive ID 5th Anniversary LIVE 'Chromatic Future' dan guest author LN Roshidere.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf21.jpg",
    startsAt: new Date("2025-11-15T09:00:00+07:00"),
    endsAt: new Date("2025-11-16T18:00:00+07:00"),
    budget: 2000000,
    isActive: false
  },
  {
    slug: "cf20",
    name: "Comic Frontier 20 (Comic Frontier XX)",
    description: "Perayaan edisi ke-20 menyatukan Bushiroad EXPO 2025, Q&A CEO Takaaki Kidani, seiyuu BanG Dream!, dan panggung kreator lokal.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf20.jpg",
    startsAt: new Date("2025-05-24T09:00:00+07:00"),
    endsAt: new Date("2025-05-25T18:00:00+07:00"),
    budget: 2000000,
    isActive: false
  },
  {
    slug: "cf19",
    name: "Comic Frontier 19 (Comifuro 19)",
    description: "Menghadirkan konser anisong Konomi Suzuki dan panggung kolaborasi Yuko Suzuhana (Wagakki Band) x Upiko di 4 hall ICE BSD.",
    venue: "ICE BSD City (Hall 7 - 10)",
    bannerImageUrl: "/banner/cf19.jpg",
    startsAt: new Date("2024-11-09T09:00:00+07:00"),
    endsAt: new Date("2024-11-10T18:00:00+07:00"),
    budget: 1500000,
    isActive: false
  },
  {
    slug: "cf18",
    name: "Comic Frontier 18 (Comifuro 18)",
    description: "Penyelenggaraan Bushiroad EXPO 2024, bintang tamu seiyuu Aina Aiba & Yuka Nishio, serta pembukaan Hall 6 terdedikasi kuliner F&B.",
    venue: "ICE BSD City (Hall 6 - 10)",
    bannerImageUrl: "/banner/cf18.jpg",
    startsAt: new Date("2024-05-11T09:00:00+07:00"),
    endsAt: new Date("2024-05-12T18:00:00+07:00"),
    budget: 1500000,
    isActive: false
  },
  {
    slug: "cf17",
    name: "Comic Frontier 17 (Comifuro 17)",
    description: "Ekspansi 4 hall di ICE BSD, peluncuran perdana shuttle bus gratis Lorena, dan implementasi 100% online ticketing via Ticket2u.",
    venue: "ICE BSD City (Hall 7 - 10)",
    bannerImageUrl: "/banner/cf17.jpg",
    startsAt: new Date("2023-12-16T09:00:00+07:00"),
    endsAt: new Date("2023-12-17T18:00:00+07:00"),
    budget: 1000000,
    isActive: false
  },
  {
    slug: "cf16",
    name: "Comic Frontier 16 (Comifuro 16)",
    description: "Perluasan ke 3 hall ICE BSD, sesi Meet & Greet hololive ID, dan pasar doujinshi 800+ circle kreator.",
    venue: "ICE BSD City (Hall 8 - 10)",
    bannerImageUrl: "/banner/cf16.jpg",
    startsAt: new Date("2023-05-06T09:00:00+07:00"),
    endsAt: new Date("2023-05-07T18:00:00+07:00"),
    budget: 1000000,
    isActive: false
  }
];
```
