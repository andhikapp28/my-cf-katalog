import Link from "next/link";
import { ArrowLeft, Layers, ShieldCheck, Smartphone, WifiOff, Zap } from "lucide-react";

export const metadata = {
  title: "Documentation: ComiPocket Guide",
  description: "Dokumentasi dan panduan resmi penggunaan ComiPocket untuk berburu karya di Comic Frontier ICE BSD."
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111215]">
      <section className="bg-[#5398DA] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        <div className="container-shell max-w-4xl mx-auto relative z-10 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="pt-2">
            <p className="font-mono text-xs font-bold tracking-[0.25em] text-[#D6F834] uppercase">
              USER GUIDE & ARCHITECTURE
            </p>
            <h1 className="mt-1 font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase text-white">
              DOCUMENTATION
            </h1>
            <p className="mt-3 text-sm sm:text-base font-medium text-white/90 max-w-2xl leading-relaxed">
              Panduan lengkap penggunaan ComiPocket, strategi berburu di ICE BSD tanpa sinyal, dan spesifikasi sistem aplikasi.
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container-shell max-w-4xl mx-auto space-y-12">
          <article className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F84632] uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              <span>BAB 01 · LATAR BELAKANG</span>
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-black uppercase text-[#111215]">
              Krisis Sinyal & Realita Venue ICE BSD
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Di dalam Hall 8, 9, dan 10 ICE BSD City saat Comic Frontier berlangsung, puluhan ribu pengunjung memadati ruang tertutup yang sama. Hal ini menyebabkan menara BTS seluler mengalami kelebihan beban (*congestion*), sehingga koneksi internet seluler hampir selalu terputus atau sangat lambat.
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              ComiPocket dirancang dengan filosofi **Offline-First**. Semua data katalog, gambar denah, dan catatan belanja disimpan langsung ke dalam memori peramban (*Cache Storage & LocalStorage*) ponsel kamu, sehingga tetap dapat diakses dengan lancar meskipun perangkat berada dalam mode pesawat (*Airplane Mode*).
            </p>
          </article>
          <article className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E56C8] uppercase tracking-wider">
              <WifiOff className="h-4 w-4" />
              <span>BAB 02 · FITUR OFFLINE PWA</span>
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-black uppercase text-[#111215]">
              Persiapan H-1 Sebelum Berangkat
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-zinc-700 font-medium">
              <li>
                <strong>Buka ComiPocket di Rumah:</strong> Gunakan koneksi Wi-Fi yang stabil pada H-1 atau pagi hari sebelum menuju venue ICE BSD.
              </li>
              <li>
                <strong>Tekan Tombol &quot;Siapkan Offline Hari-H&quot;:</strong> Tombol ini berada di bagian atas beranda. Sistem akan mengunduh seluruh data esensial ke memori peramban.
              </li>
              <li>
                <strong>Pasang ke Layar Utama (*Add to Home Screen*):</strong> Pada peramban Safari (iOS) atau Chrome (Android), pilih menu &quot;Bagikan&quot; atau &quot;Opsi&quot; lalu tekan <em>&quot;Add to Home Screen&quot;</em> untuk menginstal ComiPocket layaknya aplikasi mandiri.
              </li>
            </ol>
          </article>
          <article className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F84632] uppercase tracking-wider">
              <Smartphone className="h-4 w-4" />
              <span>BAB 03 · WISHLIST & CASH ATM</span>
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-black uppercase text-[#111215]">
              Perencanaan Anggaran & Uang Tunai
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Setiap kali kamu menandai barang incaran dengan tombol hati (♥), sistem di ponselmu secara otomatis menghitung berapa nominal uang tunai yang perlu disiapkan.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 space-y-1">
                <span className="font-mono text-xs font-bold text-[#111215] uppercase">Tanpa Perlu Login</span>
                <p className="text-xs text-zinc-500">
                  Data incaran murni tersimpan di perangkatmu tanpa pelacakan atau kebutuhan registrasi akun.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 space-y-1">
                <span className="font-mono text-xs font-bold text-[#F84632] uppercase">Kesiapan Tunai ATM</span>
                <p className="text-xs text-zinc-500">
                  Mesin ATM di sekitar ICE BSD sering kehabisan uang tunai saat siang hari-H. Lakukan penarikan sebelum memasuki area venue.
                </p>
              </div>
            </div>
          </article>
          <article className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E56C8] uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>BAB 04 · NAVIGASI DENAH</span>
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-black uppercase text-[#111215]">
              Navigasi Lorong Hall 8 & 9
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Format kode booth Comic Frontier umumnya terdiri dari kode lorong dan nomor meja (misalnya <code>A-15a</code> atau <code>TC-12</code>). Gunakan fitur navigasi denah interaktif pada menu <strong>Floor Maps</strong> untuk melihat titik lokasi gerai serta menggunakan tombol <em>Next Booth</em> untuk menyusuri rute belanja secara teratur.
            </p>
          </article>
          <article className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>BAB 05 · PRIVASI & LISENSI</span>
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-black uppercase text-[#111215]">
              Etika & Hak Kekayaan Intelektual
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              ComiPocket adalah perangkat lunak sumber terbuka independen yang dibangun untuk mendukung komunitas kreator Comic Frontier. Seluruh hak cipta karya ilustrasi, komik, dan kekayaan intelektual yang terdaftar di dalam katalog tetap dimiliki sepenuhnya oleh masing-masing kreator dan lingkar kreatif terkait.
            </p>
          </article>

        </div>
      </section>
    </div>
  );
}
