import {
  AlertCircle,
  FileCheck2,
  ShieldAlert,
  Sparkles,
  Users
} from "lucide-react";

export interface TermRuleItem {
  number: string;
  title: string;
  icon: typeof AlertCircle;
  summary: string;
  rules: string[];
}

export const DEFAULT_TERMS: TermRuleItem[] = [
  {
    number: "01",
    title: "Tiket Masuk & Identitas",
    icon: FileCheck2,
    summary: "Penukaran wristband resmi dan verifikasi identitas pengunjung di area gate.",
    rules: [
      "Penukaran e-voucher wristband di gate Hall 10 mulai pukul 08:00 WIB.",
      "Wajib menunjukkan kartu identitas resmi (KTP, kartu pelajar, atau paspor) yang sesuai dengan akun pemesan tiket.",
      "Pintu masuk hall ditutup pukul 18:30 WIB; anak berusia 2 tahun ke atas wajib memiliki tiket masuk."
    ]
  },
  {
    number: "02",
    title: "Larangan Keras Gen-AI & Bootleg",
    icon: ShieldAlert,
    summary: "Perlindungan karya orisinal dan integritas seniman independen di Artist Alley.",
    rules: [
      "Seluruh karya cetak, komik, dan merchandise wajib merupakan kreasi orisinal atau fanart non-AI.",
      "Dilarang memperjualbelikan karya bajakan, barang tiruan (bootleg), atau materi hasil unduhan tanpa izin kreator asli.",
      "Pelanggaran berakibat diskualifikasi langsung dan penutupan stan tanpa kompensasi biaya sewa."
    ]
  },
  {
    number: "03",
    title: "Regulasi Senjata Cosplay Busa EVA",
    icon: Sparkles,
    summary: "Standar bahan properti kostum demi keamanan seluruh pengunjung di dalam venue.",
    rules: [
      "Properti senjata hanya diizinkan berbahan busa EVA lunak, karton, atau kayu ringan dengan ujung tumpul.",
      "Dilarang membawa senjata tajam logam, pemukul keras, replika senjata api (termasuk airsoft gun), dan bahan peledak.",
      "Seluruh properti wajib didaftarkan dan diperiksa petugas keamanan di pos inspeksi sebelum memasuki area hall."
    ]
  },
  {
    number: "04",
    title: "Etika Foto Cosplay is Not Consent",
    icon: Users,
    summary: "Prinsip saling menghargai privasi dan batasan kenyamanan para cosplayer.",
    rules: [
      "Wajib meminta izin secara sopan sebelum mengambil foto, video, atau mengajak berfoto bersama cosplayer.",
      "Sesi pemotretan hanya diizinkan di area publik dan zona foto resmi, tanpa menghalangi lorong jalan pengunjung.",
      "Dilarang melakukan kontak fisik tanpa persetujuan, mengintimidasi, atau memotret saat cosplayer sedang beristirahat atau makan."
    ]
  }
];

export function EventTermsSection({
  terms = DEFAULT_TERMS
}: {
  terms?: TermRuleItem[];
}) {
  return (
    <section
      aria-labelledby="terms-heading"
      className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6"
    >
      <div className="border-b border-zinc-100 pb-5">
        <h2
          id="terms-heading"
          className="font-[var(--font-display)] text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900"
        >
          Tata Tertib &amp; Ketentuan Masuk
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 font-normal">
          Pedoman resmi pengunjung demi kenyamanan, keselamatan, dan apresiasi karya di area festival.
        </p>
      </div>

      <div className="space-y-4">
        {terms.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.number}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50/80"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 font-mono text-xs font-black text-white shadow-xs">
                  {item.number}
                </span>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="font-mono text-sm sm:text-base font-bold text-zinc-900">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 font-normal">
                    {item.summary}
                  </p>

                  <ul className="mt-2 space-y-1.5 pt-1 text-xs sm:text-sm text-zinc-700">
                    {item.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
