export default function Loading() {
  return (
    <div className="container-shell py-20">
      <div
        role="status"
        aria-live="polite"
        className="panel flex min-h-[260px] items-center justify-center px-6 text-sm text-ink-700 font-medium"
      >
        Memuat data katalog...
      </div>
    </div>
  );
}


