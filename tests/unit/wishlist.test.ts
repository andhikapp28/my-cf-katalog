import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToWishlist,
  calculateAtmCashReadiness,
  calculateRequiredCash,
  calculateWishlistSummary,
  calculateWishlistTotal,
  clearPurchasedProducts,
  clearWishlist,
  compareBoothOrder,
  getPurchasedProductIds,
  getPurchasedServerSnapshot,
  getPurchasedSnapshot,
  getWishlistProductIds,
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  isBrowserStorageAvailable,
  isInWishlist,
  isCircleInWishlist,
  isProductPurchased,
  removeFromWishlist,
  removePurchasedProduct,
  savePurchasedProductIds,
  saveWishlistProductIds,
  subscribePurchased,
  subscribeWishlist,
  toggleCircleWishlist,
  togglePurchasedProduct,
  toggleWishlist,
  WISHLIST_PURCHASED_STORAGE_KEY,
  WISHLIST_PURCHASED_UPDATED_EVENT,
  WISHLIST_STORAGE_KEY,
  WISHLIST_UPDATED_EVENT,
  type WishlistProductItem
} from "@/lib/wishlist";

// Helper membuat mock in-memory localStorage
function createMockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _getStore: () => store
  };
}

describe("lib/wishlist - SSR & Server Environment Safety", () => {
  it("mengembalikan array kosong [] di server tanpa error (aman SSR hydration)", () => {
    // Di lingkungan node murni tanpa mock window
    expect(getWishlistProductIds()).toEqual([]);
    expect(getWishlistServerSnapshot()).toEqual([]);
    expect(getWishlistSnapshot()).toEqual([]);
  });

  it("fungsi mutasi storage mengembalikan false dengan anggun di server", () => {
    expect(saveWishlistProductIds(["prod-1"])).toBe(false);
    expect(addToWishlist("prod-1")).toBe(false);
    expect(removeFromWishlist("prod-1")).toBe(false);
    expect(toggleWishlist("prod-1")).toBe(false);
    expect(clearWishlist()).toBe(false);
    expect(isBrowserStorageAvailable()).toBe(false);
  });

  it("subscribeWishlist mengembalikan fungsi cleanup no-op di server", () => {
    const unsubscribe = subscribeWishlist(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
  });

  it("mengekspor konstanta event dan storage key dengan benar", () => {
    expect(WISHLIST_UPDATED_EVENT).toBe("comipocket:wishlist-updated");
    expect(WISHLIST_STORAGE_KEY).toBe("comipocket_wishlist_ids");
  });
});

type ListenerFn = (...args: unknown[]) => void;

describe("lib/wishlist - Browser Client Storage", () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;
  let listeners: Record<string, ListenerFn[]> = {};

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    listeners = {};

    // Setup global window mock
    const mockWindow = {
      localStorage: mockStorage,
      addEventListener: vi.fn((event: string, cb: ListenerFn) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
      }),
      removeEventListener: vi.fn((event: string, cb: ListenerFn) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((fn) => fn !== cb);
        }
      }),
      dispatchEvent: vi.fn((event: Event) => {
        const cbs = listeners[event.type] || [];
        cbs.forEach((fn) => fn(event));
        return true;
      })
    };

    vi.stubGlobal("window", mockWindow);
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal(
      "CustomEvent",
      class MockCustomEvent {
        type: string;
        detail?: unknown;
        constructor(type: string, params?: { detail?: unknown }) {
          this.type = type;
          this.detail = params?.detail;
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearWishlist();
  });

  it("isBrowserStorageAvailable mendeteksi ketersediaan localStorage", () => {
    expect(isBrowserStorageAvailable()).toBe(true);
  });

  it("saveWishlistProductIds menyimpan data, menduplikasi ID, dan broadcast event", () => {
    const success = saveWishlistProductIds(["prod-1", "prod-2", "prod-1", "  prod-3  "]);
    expect(success).toBe(true);

    const stored = JSON.parse(mockStorage.getItem(WISHLIST_STORAGE_KEY) || "[]");
    expect(stored).toEqual(["prod-1", "prod-2", "prod-3"]);
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it("getWishlistProductIds mengambil data tersimpan secara akurat", () => {
    mockStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(["p-1", "p-2"]));
    expect(getWishlistProductIds()).toEqual(["p-1", "p-2"]);
  });

  it("getWishlistProductIds tahan terhadap data rusak atau format bukan array", () => {
    mockStorage.setItem(WISHLIST_STORAGE_KEY, "{ bukan json array }");
    expect(getWishlistProductIds()).toEqual([]);

    mockStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({ obj: "bukan array" }));
    expect(getWishlistProductIds()).toEqual([]);
  });

  it("addToWishlist menambah item baru dan tidak menduplikasi jika sudah ada", () => {
    addToWishlist("item-1");
    expect(getWishlistProductIds()).toEqual(["item-1"]);

    addToWishlist("item-2");
    expect(getWishlistProductIds()).toEqual(["item-1", "item-2"]);

    // Tambah lagi item-1 tidak membuat duplikat
    addToWishlist("item-1");
    expect(getWishlistProductIds()).toEqual(["item-1", "item-2"]);
  });

  it("addToWishlist mengabaikan input string kosong atau null", () => {
    expect(addToWishlist("")).toBe(false);
    expect(addToWishlist("   ")).toBe(false);
    // @ts-expect-error test invalid param
    expect(addToWishlist(null)).toBe(false);
  });

  it("removeFromWishlist menghapus item yang ditentukan", () => {
    saveWishlistProductIds(["item-a", "item-b", "item-c"]);
    removeFromWishlist("item-b");
    expect(getWishlistProductIds()).toEqual(["item-a", "item-c"]);
  });

  it("toggleWishlist menambah saat belum ada dan menghapus saat sudah ada", () => {
    const added = toggleWishlist("item-x");
    expect(added).toBe(true);
    expect(getWishlistProductIds()).toContain("item-x");

    const removed = toggleWishlist("item-x");
    expect(removed).toBe(false);
    expect(getWishlistProductIds()).not.toContain("item-x");
  });

  it("isInWishlist memeriksa keberadaan item baik dari storage maupun parameter", () => {
    saveWishlistProductIds(["id-1", "id-2"]);

    // Mengambil langsung dari storage
    expect(isInWishlist("id-1")).toBe(true);
    expect(isInWishlist("id-99")).toBe(false);

    // Dengan parameter array custom
    expect(isInWishlist("alpha", ["alpha", "beta"])).toBe(true);
    expect(isInWishlist("gamma", ["alpha", "beta"])).toBe(false);

    // Dengan parameter Set custom
    expect(isInWishlist("alpha", new Set(["alpha", "beta"]))).toBe(true);
  });

  it("clearWishlist menghapus seluruh isi wishlist", () => {
    saveWishlistProductIds(["item-1", "item-2"]);
    expect(clearWishlist()).toBe(true);
    expect(getWishlistProductIds()).toEqual([]);
  });

  it("subscribeWishlist menerima panggilan saat ada update wishlist", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeWishlist(callback);

    addToWishlist("prod-new");
    expect(callback).toHaveBeenCalledWith(["prod-new"]);

    unsubscribe();
  });

  it("getWishlistSnapshot menjaga referensi array stabil jika storage tidak berubah", () => {
    saveWishlistProductIds(["item-1", "item-2"]);

    const snap1 = getWishlistSnapshot();
    const snap2 = getWishlistSnapshot();

    // Referensi identik penting untuk React useSyncExternalStore agar tidak infinite render loop
    expect(Object.is(snap1, snap2)).toBe(true);
  });

  describe("Circle Wishlist Integration", () => {
    it("isCircleInWishlist mendeteksi circle baik lewat circleId maupun produknya", () => {
      saveWishlistProductIds(["circle-alpha", "prod-beta"]);

      // Deteksi via circleId langsung
      expect(isCircleInWishlist("circle-alpha")).toBe(true);

      // Deteksi via produk milik circle
      expect(isCircleInWishlist("circle-beta", ["prod-beta", "prod-other"])).toBe(true);

      // Circle yang belum masuk
      expect(isCircleInWishlist("circle-gamma", ["prod-gamma"])).toBe(false);
    });

    it("toggleCircleWishlist menambah dan menghapus circle beserta produknya", () => {
      const added = toggleCircleWishlist("c-1", ["p-1", "p-2"]);
      expect(added).toBe(true);
      expect(isCircleInWishlist("c-1")).toBe(true);
      expect(getWishlistProductIds()).toContain("c-1");
      expect(getWishlistProductIds()).toContain("p-1");

      const removed = toggleCircleWishlist("c-1", ["p-1", "p-2"]);
      expect(removed).toBe(false);
      expect(isCircleInWishlist("c-1")).toBe(false);
      expect(getWishlistProductIds()).not.toContain("c-1");
      expect(getWishlistProductIds()).not.toContain("p-1");
    });
  });

  describe("Purchased Checklist Storage", () => {
    it("dapat menambah, mengecek, toggle, dan menghapus status terbeli", () => {
      expect(getPurchasedProductIds()).toEqual([]);
      expect(isProductPurchased("p-1")).toBe(false);

      // toggle true
      const added = togglePurchasedProduct("p-1");
      expect(added).toBe(true);
      expect(isProductPurchased("p-1")).toBe(true);
      expect(getPurchasedProductIds()).toContain("p-1");

      // toggle false
      const removed = togglePurchasedProduct("p-1");
      expect(removed).toBe(false);
      expect(isProductPurchased("p-1")).toBe(false);

      // clear
      togglePurchasedProduct("p-2");
      expect(getPurchasedProductIds()).toEqual(["p-2"]);
      clearPurchasedProducts();
      expect(getPurchasedProductIds()).toEqual([]);
    });

    it("mengekspor konstanta event dan storage key dengan benar", () => {
      expect(WISHLIST_PURCHASED_STORAGE_KEY).toBe("comipocket_wishlist_purchased_ids");
      expect(WISHLIST_PURCHASED_UPDATED_EVENT).toBe("comipocket:wishlist-purchased-updated");
    });
  });
});

describe("lib/wishlist - Domain Calculations (Total & Cash Readiness)", () => {
  const sampleProducts: WishlistProductItem[] = [
    {
      id: "prod-1",
      price: 50000,
      quantity: 2, // 100,000
      purchaseType: "ON_THE_SPOT",
      status: "TARGET",
      targetDay: "DAY_1"
    },
    {
      id: "prod-2",
      price: 150000,
      quantity: 1, // 150,000
      purchaseType: "PO",
      status: "PO_DONE",
      targetDay: "DAY_1"
    },
    {
      id: "prod-3",
      price: 35000,
      quantity: 1, // 35,000
      purchaseType: "ON_THE_SPOT",
      status: "PURCHASED",
      targetDay: "DAY_2"
    },
    {
      id: "prod-4",
      price: 75000,
      quantity: 1, // 75,000
      purchaseType: "ON_THE_SPOT",
      status: "CANCELLED",
      targetDay: "DAY_1"
    },
    {
      id: "prod-5",
      price: 120000,
      quantity: 1, // 120,000
      purchaseType: "ON_THE_SPOT",
      status: "SOLD_OUT",
      targetDay: "DAY_2"
    },
    {
      id: "prod-6",
      price: 25000,
      quantity: 3, // 75,000
      purchaseType: "ON_THE_SPOT",
      status: "TARGET",
      targetDay: "ALL_DAYS"
    }
  ];

  describe("calculateWishlistTotal", () => {
    it("menghitung total harga seluruh produk yang valid (default mengabaikan CANCELLED dan SOLD_OUT)", () => {
      // Valid items:
      // prod-1: 50000 * 2 = 100000
      // prod-2: 150000 * 1 = 150000
      // prod-3: 35000 * 1 = 35000
      // prod-6: 25000 * 3 = 75000
      // Total = 360,000
      const total = calculateWishlistTotal(sampleProducts);
      expect(total).toBe(360000);
    });

    it("memfilter berdasarkan daftar ID wishlist yang diberikan", () => {
      // Hanya hitung prod-1 dan prod-2
      // prod-1 (100000) + prod-2 (150000) = 250,000
      const total = calculateWishlistTotal(sampleProducts, ["prod-1", "prod-2"]);
      expect(total).toBe(250000);
    });

    it("dapat menerima Set sebagai daftar ID", () => {
      const total = calculateWishlistTotal(sampleProducts, new Set(["prod-1"]));
      expect(total).toBe(100000);
    });

    it("dapat menyertakan item CANCELLED dan SOLD_OUT jika opsi dikonfigurasi", () => {
      const totalWithAll = calculateWishlistTotal(sampleProducts, null, {
        excludeCancelled: false,
        excludeSoldOut: false
      });
      // 360000 + prod-4 (75000) + prod-5 (120000) = 555,000
      expect(totalWithAll).toBe(555000);
    });

    it("dapat memfilter total belanja per hari event", () => {
      // Day 1 (termasuk ALL_DAYS):
      // prod-1 (Day 1: 100000) + prod-2 (Day 1: 150000) + prod-6 (ALL_DAYS: 75000) = 325,000
      const day1Total = calculateWishlistTotal(sampleProducts, null, { targetDay: "DAY_1" });
      expect(day1Total).toBe(325000);

      // Day 2 (termasuk ALL_DAYS):
      // prod-3 (Day 2: 35000) + prod-6 (ALL_DAYS: 75000) = 110,000
      const day2Total = calculateWishlistTotal(sampleProducts, null, { targetDay: "DAY_2" });
      expect(day2Total).toBe(110000);
    });

    it("menangani harga 0 atau kuantitas null dengan aman", () => {
      const edgeProducts: WishlistProductItem[] = [
        { id: "e-1", price: 0, quantity: 2 },
        { id: "e-2", price: 50000, quantity: null }, // default quantity 1
        { id: "e-3", price: -10000, quantity: 1 } // negative clamped to 0
      ];
      expect(calculateWishlistTotal(edgeProducts)).toBe(50000);
    });
  });

  describe("calculateRequiredCash", () => {
    it("menghitung uang tunai hanya untuk item on-the-spot aktif yang belum dibeli", () => {
      // Kriteria: ON_THE_SPOT, belum terbeli, bukan cancelled/sold out
      // prod-1: ON_THE_SPOT, TARGET, belum dibeli -> 100,000
      // prod-2: PO -> diabaikan dari cash
      // prod-3: ON_THE_SPOT, tapi PURCHASED -> diabaikan
      // prod-4: CANCELLED -> diabaikan
      // prod-5: SOLD_OUT -> diabaikan
      // prod-6: ON_THE_SPOT, TARGET -> 75,000
      // Total Cash = 100,000 + 75,000 = 175,000
      const cash = calculateRequiredCash(sampleProducts);
      expect(cash).toBe(175000);
    });

    it("dapat menyertakan item PO jika opsi includePO diaktifkan", () => {
      // Tambah prod-2 (PO_DONE, belum dibeli di venue): +150,000
      // 175000 + 150000 = 325,000
      const cashWithPO = calculateRequiredCash(sampleProducts, null, { includePO: true });
      expect(cashWithPO).toBe(325000);
    });

    it("memfilter kebutuhan cash per hari belanja di venue", () => {
      // Day 1 cash: prod-1 (100,000) + prod-6 (ALL_DAYS: 75,000) = 175,000
      expect(calculateRequiredCash(sampleProducts, null, { targetDay: "DAY_1" })).toBe(175000);

      // Day 2 cash: prod-6 (ALL_DAYS: 75,000)
      // (prod-3 Day 2 sudah PURCHASED, prod-5 Day 2 SOLD_OUT)
      expect(calculateRequiredCash(sampleProducts, null, { targetDay: "DAY_2" })).toBe(75000);
    });
  });

  describe("calculateWishlistSummary", () => {
    it("menghasilkan rekapitulasi lengkap wishlist", () => {
      const summary = calculateWishlistSummary(sampleProducts);

      // 4 active valid items (prod-1, prod-2, prod-3, prod-6)
      expect(summary.totalItems).toBe(4);
      // Kuantitas: 2 + 1 + 1 + 3 = 7
      expect(summary.totalQuantity).toBe(7);
      // Total harga valid: 360,000
      expect(summary.totalPrice).toBe(360000);
      // Cash yang dibutuhkan (prod-1: 100k, prod-6: 75k): 175,000
      expect(summary.requiredCash).toBe(175000);
      // Total PO (prod-2): 150,000
      expect(summary.preOrderTotal).toBe(150000);
      // Total yang sudah terbeli (prod-3): 35,000
      expect(summary.purchasedTotal).toBe(35000);
      // Sisa yang harus dibayar (360,000 - 35,000): 325,000
      expect(summary.remainingTotal).toBe(325000);
    });

    it("menghasilkan 0 jika daftar kosong", () => {
      const summary = calculateWishlistSummary([]);
      expect(summary).toEqual({
        totalItems: 0,
        totalQuantity: 0,
        totalPrice: 0,
        requiredCash: 0,
        preOrderTotal: 0,
        purchasedTotal: 0,
        remainingTotal: 0
      });
    });
  });

  describe("calculateAtmCashReadiness", () => {
    it("menghitung kekurangan uang tunai dan rekomendasi lembar ATM ICE BSD", () => {
      // Dibutuhkan 350.000, uang di dompet 100.000 -> Kurang 250.000
      const res = calculateAtmCashReadiness(350000, 100000);
      expect(res.requiredCash).toBe(350000);
      expect(res.cashInHand).toBe(100000);
      expect(res.shortfall).toBe(250000);
      expect(res.notes50k).toBe(5); // 250k / 50k = 5 lembar
      expect(res.notes100k).toBe(3); // 250k / 100k = 3 lembar (300k)
      expect(res.recommendedWithdrawal50k).toBe(250000);
      expect(res.recommendedWithdrawal100k).toBe(300000);
      expect(res.isSufficient).toBe(false);
    });

    it("menangani kondisi saat uang tunai di dompet sudah mencukupi", () => {
      const res = calculateAtmCashReadiness(200000, 250000);
      expect(res.shortfall).toBe(0);
      expect(res.notes50k).toBe(0);
      expect(res.notes100k).toBe(0);
      expect(res.isSufficient).toBe(true);
    });

    it("menangani input 0 atau tanpa cash in hand", () => {
      const res = calculateAtmCashReadiness(125000);
      expect(res.shortfall).toBe(125000);
      expect(res.notes50k).toBe(3); // 150k
      expect(res.notes100k).toBe(2); // 200k
    });
  });

  describe("compareBoothOrder", () => {
    it("mengurutkan berdasarkan Hall secara natural (Hall 8 sebelum Hall 9)", () => {
      const a = { hall: "Hall 8", boothCode: "B-01" };
      const b = { hall: "Hall 9", boothCode: "A-01" };
      expect(compareBoothOrder(a, b)).toBeLessThan(0);
      expect(compareBoothOrder(b, a)).toBeGreaterThan(0);
    });

    it("mengurutkan berdasarkan boothCode di dalam Hall yang sama (A-15a sebelum B-02)", () => {
      const a = { hall: "Hall 8", boothCode: "A-15a" };
      const b = { hall: "Hall 8", boothCode: "B-02" };
      expect(compareBoothOrder(a, b)).toBeLessThan(0);
    });

    it("menangani hall atau boothCode null/kosong dengan meletakkannya di akhir", () => {
      const a = { hall: "Hall 8", boothCode: "A-01" };
      const b = { hall: null, boothCode: "A-01" };
      expect(compareBoothOrder(a, b)).toBeLessThan(0);
    });
  });
});
