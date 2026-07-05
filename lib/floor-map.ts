export type BoothMarker = {
  id: string;
  boothCode: string;
  /** true bila SEMUA produk di booth ini sudah PURCHASED/CANCELLED/SOLD_OUT. */
  isDone: boolean;
  /** true bila booth ini punya produk priority HIGH atau status TARGET/PO_OPEN untuk event aktif. */
  isHighlighted: boolean;
};

/**
 * Pilih booth berikutnya yang perlu dikunjungi untuk rute belanja di venue.
 *
 * Aturan urutan (dipilih supaya masuk akal dipakai sambil jalan di venue,
 * tanpa perlu data koordinat jarak riil yang tidak kita punya):
 * 1. Booth yang masih "belum selesai" (`isDone === false`) saja yang dianggap kandidat.
 * 2. Booth ber-highlight (priority HIGH / status TARGET-PO_OPEN) didahulukan
 *    dari booth biasa — ini yang paling penting diburu duluan.
 * 3. Dalam grup yang sama, urut berdasar `boothCode` (natural/numeric sort)
 *    supaya predictable dan stabil antar render — booth code biasanya
 *    berkorelasi dengan urutan lorong/nomor booth di venue riil.
 * 4. Kalau `currentBoothId` diberikan, hasil adalah booth SETELAH booth
 *    tersebut di urutan itu (wrap-around ke awal daftar bila sudah di akhir)
 *    supaya tombol "Next booth" terasa seperti terus maju, bukan lompat acak.
 *    Kalau booth aktif sudah tidak ada di daftar kandidat (mis. baru saja
 *    selesai), mulai dari awal daftar.
 */
export function pickNextBooth(markers: BoothMarker[], currentBoothId?: string): BoothMarker | null {
  const pending = markers.filter((marker) => !marker.isDone);

  if (pending.length === 0) {
    return null;
  }

  const sorted = [...pending].sort((a, b) => {
    if (a.isHighlighted !== b.isHighlighted) {
      return a.isHighlighted ? -1 : 1;
    }

    return a.boothCode.localeCompare(b.boothCode, undefined, { numeric: true, sensitivity: "base" });
  });

  if (!currentBoothId) {
    return sorted[0];
  }

  const currentIndex = sorted.findIndex((marker) => marker.id === currentBoothId);

  if (currentIndex === -1) {
    return sorted[0];
  }

  return sorted[(currentIndex + 1) % sorted.length];
}

/** Batas zoom pinch untuk floor map viewer (dalam kelipatan skala 1x). */
export const FLOOR_MAP_MIN_SCALE = 1;
export const FLOOR_MAP_MAX_SCALE = 4;

export function clampScale(scale: number) {
  return Math.min(FLOOR_MAP_MAX_SCALE, Math.max(FLOOR_MAP_MIN_SCALE, scale));
}

/**
 * Hitung translate baru supaya titik fokus (mis. posisi dua jari saat pinch,
 * atau posisi marker booth saat auto-pan) tetap berada di posisi yang sama
 * secara visual sebelum & sesudah scale berubah — rumus standar "zoom around
 * a point" untuk transform CSS `translate(x, y) scale(s)`.
 */
export function computeFocalTranslate(params: {
  focalX: number;
  focalY: number;
  prevScale: number;
  nextScale: number;
  prevTranslateX: number;
  prevTranslateY: number;
}) {
  const { focalX, focalY, prevScale, nextScale, prevTranslateX, prevTranslateY } = params;

  const scaleRatio = nextScale / prevScale;
  const nextTranslateX = focalX - (focalX - prevTranslateX) * scaleRatio;
  const nextTranslateY = focalY - (focalY - prevTranslateY) * scaleRatio;

  return { translateX: nextTranslateX, translateY: nextTranslateY };
}
