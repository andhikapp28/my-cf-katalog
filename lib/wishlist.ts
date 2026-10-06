/**
 * Fondasi state Guest Wishlist untuk ComiPocket.
 *
 * Dirancang untuk arsitektur zero-login attendee Comifuro:
 * - Menyimpan daftar ID produk target belanja di `localStorage` peramban.
 * - Aman dari Next.js SSR hydration mismatch (fallback array kosong di server,
 *   referensial snapshot stabil untuk useSyncExternalStore).
 * - Sinkronisasi reaktif antar-komponen via CustomEvent 'comipocket:wishlist-updated'
 *   dan lintas tab via event 'storage'.
 * - Perhitungan total belanja dan kebutuhan uang tunai (physical cash readiness)
 *   untuk mengantisipasi kegagalan sinyal/QRIS di dalam venue pameran.
 */

export const WISHLIST_STORAGE_KEY = "comipocket_wishlist_ids";
export const WISHLIST_UPDATED_EVENT = "comipocket:wishlist-updated";

export interface WishlistProductItem {
  id: string;
  price: number;
  quantity?: number | null;
  purchaseType?: "PO" | "ON_THE_SPOT" | string | null;
  status?: string | null;
  isPurchased?: boolean | null;
  targetDay?: "DAY_1" | "DAY_2" | "ALL_DAYS" | string | null;
  isRush?: boolean | null;
}

export interface WishlistCalculationOptions {
  /**
   * Abaikan produk dengan status CANCELLED (default: true).
   */
  excludeCancelled?: boolean;
  /**
   * Abaikan produk dengan status SOLD_OUT (default: true).
   */
  excludeSoldOut?: boolean;
  /**
   * Filter spesifik hari event ("DAY_1", "DAY_2", "ALL_DAYS", atau "ALL" untuk semua).
   */
  targetDay?: "ALL" | "DAY_1" | "DAY_2" | "ALL_DAYS" | string;
}

export interface CashCalculationOptions extends WishlistCalculationOptions {
  /**
   * Sertakan item PO dalam perhitungan cash jika diaktifkan (default: false,
   * karena PO biasanya sudah dibayar transfer di muka).
   */
  includePO?: boolean;
}

export interface WishlistSummary {
  /** Jumlah produk unik aktif dalam wishlist */
  totalItems: number;
  /** Total kuantitas barang yang ingin dibeli */
  totalQuantity: number;
  /** Total estimasi belanja keseluruhan */
  totalPrice: number;
  /** Kebutuhan uang tunai fisik yang harus ditarik dari ATM sebelum masuk venue */
  requiredCash: number;
  /** Total belanja untuk item pre-order (PO) */
  preOrderTotal: number;
  /** Total belanja untuk item yang sudah berstatus terbeli */
  purchasedTotal: number;
  /** Sisa budget yang masih harus dikeluarkan (totalPrice - purchasedTotal) */
  remainingTotal: number;
}

const EMPTY_SNAPSHOT: string[] = [];
let cachedSnapshot: string[] = EMPTY_SNAPSHOT;
let lastRawStorage: string | null = null;

/**
 * Cek apakah localStorage tersedia dan dapat ditulis.
 */
export function isBrowserStorageAvailable(): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  try {
    const testKey = "__comipocket_storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Broadcast event pembaruan wishlist ke komponen client dalam tab yang sama.
 */
function dispatchWishlistUpdate(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(WISHLIST_UPDATED_EVENT, {
        detail: { wishlist: ids }
      })
    );
  } catch {
    // Abaikan jika lingkungan runtime tidak mendukung CustomEvent
  }
}

/**
 * Ambil daftar ID produk di wishlist dari localStorage.
 * Aman dipanggil di server/SSR (mengembalikan array kosong []).
 */
export function getWishlistProductIds(): string[] {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return EMPTY_SNAPSHOT;
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const result: string[] = [];
    for (const item of parsed) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed && !result.includes(trimmed)) {
          result.push(trimmed);
        }
      }
    }
    return result;
  } catch {
    return [];
  }
}

/**
 * Simpan daftar ID produk wishlist ke localStorage.
 * Mengeliminasi duplikasi ID dan membersihkan spasi berlebih.
 */
export function saveWishlistProductIds(ids: string[]): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }

  try {
    const unique = Array.from(
      new Set(
        ids
          .filter((id) => typeof id === "string" && id.trim().length > 0)
          .map((id) => id.trim())
      )
    );

    const serialized = JSON.stringify(unique);
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, serialized);
    lastRawStorage = serialized;
    cachedSnapshot = unique;

    dispatchWishlistUpdate(unique);
    return true;
  } catch {
    return false;
  }
}

/**
 * Tambahkan satu ID produk ke dalam wishlist.
 */
export function addToWishlist(productId: string): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();
  if (!trimmed) return false;

  const current = getWishlistProductIds();
  if (current.includes(trimmed)) {
    return true;
  }

  return saveWishlistProductIds([...current, trimmed]);
}

/**
 * Hapus satu ID produk dari wishlist.
 */
export function removeFromWishlist(productId: string): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();
  if (!trimmed) return false;

  const current = getWishlistProductIds();
  const next = current.filter((id) => id !== trimmed);
  if (next.length === current.length) {
    return true;
  }

  return saveWishlistProductIds(next);
}

/**
 * Toggle status wishlist suatu produk.
 * @returns `true` jika produk sekarang ada di wishlist, `false` jika telah dihapus.
 */
export function toggleWishlist(productId: string): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();
  if (!trimmed) return false;

  const current = getWishlistProductIds();
  if (current.includes(trimmed)) {
    removeFromWishlist(trimmed);
    return false;
  } else {
    addToWishlist(trimmed);
    return true;
  }
}

/**
 * Cek apakah produk tertentu tersimpan di dalam wishlist.
 */
export function isInWishlist(
  productId: string,
  wishlistIds?: string[] | Set<string> | null
): boolean {
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();

  if (wishlistIds instanceof Set) {
    return wishlistIds.has(trimmed);
  }
  if (Array.isArray(wishlistIds)) {
    return wishlistIds.includes(trimmed);
  }

  return getWishlistProductIds().includes(trimmed);
}

/**
 * Kosongkan seluruh daftar wishlist.
 */
export function clearWishlist(): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
    lastRawStorage = null;
    cachedSnapshot = EMPTY_SNAPSHOT;
    dispatchWishlistUpdate([]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Subscribe pembaruan wishlist untuk integrasi React / useSyncExternalStore.
 * Mendengarkan custom event lokal dan storage event antar-tab.
 */
export function subscribeWishlist(callback: (ids: string[]) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleUpdate = () => {
    callback(getWishlistSnapshot());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY || event.key === null) {
      lastRawStorage = null; // paksa sinkronisasi ulang snapshot
      callback(getWishlistSnapshot());
    }
  };

  window.addEventListener(WISHLIST_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(WISHLIST_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Snapshot stabil untuk client-side React useSyncExternalStore.
 * Menjamin referensi array tidak berubah jika isi storage tidak berubah,
 * mencegah infinite loop re-render pada React 18/19.
 */
export function getWishlistSnapshot(): string[] {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return EMPTY_SNAPSHOT;
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw === lastRawStorage) {
      return cachedSnapshot;
    }
    lastRawStorage = raw;
    cachedSnapshot = getWishlistProductIds();
    return cachedSnapshot;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

/**
 * Server snapshot stabil untuk Next.js SSR hydration guard.
 * Selalu mengembalikan array kosong `[]` pada proses render server.
 */
export function getWishlistServerSnapshot(): string[] {
  return EMPTY_SNAPSHOT;
}

/**
 * Filter item berdasarkan opsi hari dan status.
 */
function filterWishlistItems<T extends WishlistProductItem>(
  products: T[],
  wishlistIds?: string[] | Set<string> | null,
  options?: WishlistCalculationOptions
): T[] {
  const excludeCancelled = options?.excludeCancelled ?? true;
  const excludeSoldOut = options?.excludeSoldOut ?? true;
  const targetDay = options?.targetDay;

  let idSet: Set<string> | null = null;
  if (wishlistIds instanceof Set) {
    idSet = wishlistIds;
  } else if (Array.isArray(wishlistIds)) {
    idSet = new Set(wishlistIds);
  }

  return products.filter((product) => {
    if (idSet && !idSet.has(product.id)) {
      return false;
    }

    if (excludeCancelled && product.status === "CANCELLED") {
      return false;
    }

    if (excludeSoldOut && product.status === "SOLD_OUT") {
      return false;
    }

    if (targetDay && targetDay !== "ALL") {
      if (
        product.targetDay &&
        product.targetDay !== "ALL_DAYS" &&
        product.targetDay !== targetDay
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Hitung total harga item di wishlist.
 * Mengalikan harga dengan kuantitas (default kuantitas: 1).
 */
export function calculateWishlistTotal(
  products: WishlistProductItem[],
  wishlistIds?: string[] | Set<string> | null,
  options?: WishlistCalculationOptions
): number {
  const filtered = filterWishlistItems(products, wishlistIds, options);

  return filtered.reduce((sum, item) => {
    const price = Math.max(0, item.price || 0);
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    return sum + price * qty;
  }, 0);
}

/**
 * Hitung kebutuhan uang tunai (Physical Cash Required) untuk item on-the-spot di venue.
 *
 * Mengapa ini penting di event anime/komik seperti Comifuro:
 * Sinyal seluler di hall konvensi (misal ICE BSD) kerap macet total (cellular black hole),
 * menyebabkan QRIS dan transfer m-banking gagal. Pengunjung wajib menyiapkan uang tunai
 * fisik yang ditarik dari ATM sebelum masuk venue.
 *
 * Kriteria yang dihitung:
 * - Pembelian On-The-Spot (`purchaseType !== 'PO'`, default di venue).
 * - Belum dibeli (`!isPurchased` dan `status !== 'PURCHASED'`).
 * - Bukan barang batal atau habis (`status !== 'CANCELLED'` dan `status !== 'SOLD_OUT'`).
 */
export function calculateRequiredCash(
  products: WishlistProductItem[],
  wishlistIds?: string[] | Set<string> | null,
  options?: CashCalculationOptions
): number {
  const includePO = options?.includePO ?? false;
  const filtered = filterWishlistItems(products, wishlistIds, options);

  return filtered.reduce((sum, item) => {
    // Abaikan jika sudah dibeli
    const isAlreadyPurchased = Boolean(item.isPurchased || item.status === "PURCHASED");
    if (isAlreadyPurchased) {
      return sum;
    }

    // Jika item adalah PO dan includePO false, abaikan dari cash venue
    const isPO = item.purchaseType === "PO";
    if (isPO && !includePO) {
      return sum;
    }

    const price = Math.max(0, item.price || 0);
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    return sum + price * qty;
  }, 0);
}

/**
 * Hitung ringkasan lengkap wishlist (total item, kuantitas, harga, kebutuhan cash, dll).
 */
export function calculateWishlistSummary(
  products: WishlistProductItem[],
  wishlistIds?: string[] | Set<string> | null,
  options?: WishlistCalculationOptions
): WishlistSummary {
  const filtered = filterWishlistItems(products, wishlistIds, options);

  let totalQuantity = 0;
  let totalPrice = 0;
  let requiredCash = 0;
  let preOrderTotal = 0;
  let purchasedTotal = 0;

  for (const item of filtered) {
    const price = Math.max(0, item.price || 0);
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const subtotal = price * qty;

    totalQuantity += qty;
    totalPrice += subtotal;

    const isPurchased = Boolean(item.isPurchased || item.status === "PURCHASED");
    const isPO = item.purchaseType === "PO";

    if (isPurchased) {
      purchasedTotal += subtotal;
    } else {
      if (!isPO) {
        requiredCash += subtotal;
      }
    }

    if (isPO) {
      preOrderTotal += subtotal;
    }
  }

  const remainingTotal = Math.max(0, totalPrice - purchasedTotal);

  return {
    totalItems: filtered.length,
    totalQuantity,
    totalPrice,
    requiredCash,
    preOrderTotal,
    purchasedTotal,
    remainingTotal
  };
}

export const WISHLIST_PURCHASED_STORAGE_KEY = "comipocket_wishlist_purchased_ids";
export const WISHLIST_PURCHASED_UPDATED_EVENT = "comipocket:wishlist-purchased-updated";

let cachedPurchasedSnapshot: string[] = EMPTY_SNAPSHOT;
let lastRawPurchasedStorage: string | null = null;

function dispatchPurchasedUpdate(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(WISHLIST_PURCHASED_UPDATED_EVENT, {
        detail: { purchased: ids }
      })
    );
  } catch {
    // Abaikan jika lingkungan runtime tidak mendukung CustomEvent
  }
}

/**
 * Ambil daftar ID produk yang telah ditandai terbeli (✓) dari localStorage.
 * Aman dipanggil di server/SSR (mengembalikan array kosong []).
 */
export function getPurchasedProductIds(): string[] {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return EMPTY_SNAPSHOT;
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_PURCHASED_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const result: string[] = [];
    for (const item of parsed) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed && !result.includes(trimmed)) {
          result.push(trimmed);
        }
      }
    }
    return result;
  } catch {
    return [];
  }
}

/**
 * Simpan daftar ID produk yang telah ditandai terbeli ke localStorage.
 */
export function savePurchasedProductIds(ids: string[]): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }

  try {
    const unique = Array.from(
      new Set(
        ids
          .filter((id) => typeof id === "string" && id.trim().length > 0)
          .map((id) => id.trim())
      )
    );

    const serialized = JSON.stringify(unique);
    window.localStorage.setItem(WISHLIST_PURCHASED_STORAGE_KEY, serialized);
    lastRawPurchasedStorage = serialized;
    cachedPurchasedSnapshot = unique;

    dispatchPurchasedUpdate(unique);
    return true;
  } catch {
    return false;
  }
}

/**
 * Tandai satu produk sebagai telah dibeli (tambahkan ke daftar terbeli).
 */
export function addPurchasedProduct(productId: string): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();
  if (!trimmed) return false;

  const current = getPurchasedProductIds();
  if (current.includes(trimmed)) {
    return true;
  }

  return savePurchasedProductIds([...current, trimmed]);
}

/**
 * Batalkan tanda terbeli untuk satu produk.
 */
export function removePurchasedProduct(productId: string): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();
  if (!trimmed) return false;

  const current = getPurchasedProductIds();
  const next = current.filter((id) => id !== trimmed);
  if (next.length === current.length) {
    return true;
  }

  return savePurchasedProductIds(next);
}

/**
 * Toggle status checklist terbeli ('[ ] Beli' <-> '✓ Dibeli').
 * Mengembalikan `true` bila sekarang berstatus dibeli, `false` bila batal dibeli.
 */
export function togglePurchasedProduct(productId: string): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();
  if (!trimmed) return false;

  const current = getPurchasedProductIds();
  if (current.includes(trimmed)) {
    removePurchasedProduct(trimmed);
    return false;
  } else {
    addPurchasedProduct(trimmed);
    return true;
  }
}

/**
 * Cek apakah produk tertentu sudah ditandai sebagai terbeli.
 */
export function isProductPurchased(
  productId: string,
  purchasedIds?: string[] | Set<string> | null
): boolean {
  if (!productId || typeof productId !== "string") return false;
  const trimmed = productId.trim();

  if (purchasedIds instanceof Set) {
    return purchasedIds.has(trimmed);
  }
  if (Array.isArray(purchasedIds)) {
    return purchasedIds.includes(trimmed);
  }

  return getPurchasedProductIds().includes(trimmed);
}

/**
 * Reset seluruh status centang terbeli.
 */
export function clearPurchasedProducts(): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(WISHLIST_PURCHASED_STORAGE_KEY);
    lastRawPurchasedStorage = null;
    cachedPurchasedSnapshot = EMPTY_SNAPSHOT;
    dispatchPurchasedUpdate([]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Subscribe perubahan status terbeli untuk React / useSyncExternalStore.
 */
export function subscribePurchased(callback: (ids: string[]) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleUpdate = () => {
    callback(getPurchasedSnapshot());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_PURCHASED_STORAGE_KEY || event.key === null) {
      lastRawPurchasedStorage = null;
      callback(getPurchasedSnapshot());
    }
  };

  window.addEventListener(WISHLIST_PURCHASED_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(WISHLIST_PURCHASED_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getPurchasedSnapshot(): string[] {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return EMPTY_SNAPSHOT;
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_PURCHASED_STORAGE_KEY);
    if (raw === lastRawPurchasedStorage) {
      return cachedPurchasedSnapshot;
    }
    lastRawPurchasedStorage = raw;
    cachedPurchasedSnapshot = getPurchasedProductIds();
    return cachedPurchasedSnapshot;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export function getPurchasedServerSnapshot(): string[] {
  return EMPTY_SNAPSHOT;
}

export interface AtmCashReadiness {
  requiredCash: number;
  cashInHand: number;
  shortfall: number;
  notes50k: number;
  notes100k: number;
  recommendedWithdrawal50k: number;
  recommendedWithdrawal100k: number;
  isSufficient: boolean;
}

/**
 * Hitung kesiapan uang tunai fisik untuk ditarik di ATM ICE BSD sebelum masuk hall.
 */
export function calculateAtmCashReadiness(
  requiredCash: number,
  cashInHand: number = 0
): AtmCashReadiness {
  const safeCashInHand = Math.max(0, cashInHand || 0);
  const shortfall = Math.max(0, requiredCash - safeCashInHand);
  const notes50k = shortfall > 0 ? Math.ceil(shortfall / 50000) : 0;
  const notes100k = shortfall > 0 ? Math.ceil(shortfall / 100000) : 0;
  return {
    requiredCash,
    cashInHand: safeCashInHand,
    shortfall,
    notes50k,
    notes100k,
    recommendedWithdrawal50k: notes50k * 50000,
    recommendedWithdrawal100k: notes100k * 100000,
    isSufficient: shortfall === 0
  };
}

/**
 * Natural sort per Hall lalu per Lorong/Nomor Meja booth (e.g. Hall 8 A-15a -> Hall 9 C-02b).
 */
export function compareBoothOrder(
  a: { hall?: string | null; boothCode?: string | null },
  b: { hall?: string | null; boothCode?: string | null }
): number {
  const hallA = (a.hall || "").trim();
  const hallB = (b.hall || "").trim();
  if (hallA !== hallB) {
    if (!hallA) return 1;
    if (!hallB) return -1;
    return hallA.localeCompare(hallB, undefined, { numeric: true, sensitivity: "base" });
  }

  const codeA = (a.boothCode || "").trim();
  const codeB = (b.boothCode || "").trim();
  if (codeA !== codeB) {
    if (!codeA) return 1;
    if (!codeB) return -1;
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: "base" });
  }

  return 0;
}

/**
 * Cek apakah sebuah circle tersimpan di wishlist (baik via circleId langsung
 * atau melalui produk-produk milik circle ini).
 */
export function isCircleInWishlist(
  circleId: string,
  circleProductIds?: string[] | null,
  wishlistIds?: string[] | Set<string> | null
): boolean {
  if (!circleId) return false;
  const trimmed = circleId.trim();
  if (isInWishlist(trimmed, wishlistIds)) {
    return true;
  }
  if (circleProductIds && circleProductIds.length > 0) {
    return circleProductIds.some((pId) => isInWishlist(pId, wishlistIds));
  }
  return false;
}

/**
 * Toggle status wishlist untuk sebuah circle.
 * Bila sudah ada di wishlist: hapus circleId dan seluruh circleProductIds.
 * Bila belum ada di wishlist: tambahkan circleId (dan seluruh circleProductIds bila ada).
 * @returns boolean `true` jika sekarang tersimpan, `false` jika dihapus.
 */
export function toggleCircleWishlist(
  circleId: string,
  circleProductIds?: string[] | null
): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (!circleId) return false;
  const trimmedCircleId = circleId.trim();
  const current = getWishlistProductIds();
  const currentlyWishlisted = isCircleInWishlist(trimmedCircleId, circleProductIds, current);

  const targetIds = new Set<string>();
  targetIds.add(trimmedCircleId);
  if (circleProductIds) {
    for (const pId of circleProductIds) {
      if (pId && typeof pId === "string") {
        targetIds.add(pId.trim());
      }
    }
  }

  if (currentlyWishlisted) {
    const next = current.filter((id) => !targetIds.has(id));
    saveWishlistProductIds(next);
    return false;
  } else {
    const next = Array.from(new Set([...current, ...targetIds]));
    saveWishlistProductIds(next);
    return true;
  }
}


