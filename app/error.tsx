"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-shell py-20">
      <div className="panel space-y-4 px-6 py-10 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-ink-500">Terjadi masalah</p>
        <h1 className="font-[var(--font-display)] text-3xl font-semibold">Halaman gagal dimuat.</h1>
        <button
          type="button"
          onClick={() => reset()}
          className="mx-auto inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}


