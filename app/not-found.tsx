import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell py-20">
      <div className="panel space-y-4 px-6 py-10 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-ink-500">404</p>
        <h1 className="font-[var(--font-display)] text-3xl font-semibold">Data yang dicari tidak ditemukan.</h1>
        <Link href="/" className="mx-auto inline-flex rounded-full bg-brand-500 px-5 py-3 text-sm font-medium text-white">
          Kembali ke dashboard
        </Link>
      </div>
    </div>
  );
}


