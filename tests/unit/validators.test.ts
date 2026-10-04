import { describe, expect, it } from "vitest";
import {
  boothLocationSchema,
  catalogEntrySchema,
  circleSchema,
  eventSchema,
  expenseCategorySchema,
  expenseSchema,
  floorMapSchema,
  loginSchema,
  productSchema,
  quickStatusSchema
} from "@/lib/validators";

describe("loginSchema", () => {
  it("menerima email dan password valid", () => {
    const result = loginSchema.safeParse({ email: "admin@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("menolak email yang tidak valid", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("menolak password yang lebih pendek dari 8 karakter", () => {
    const result = loginSchema.safeParse({ email: "admin@example.com", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("eventSchema", () => {
  const base = {
    name: "Anime Festival",
    slug: "anime-festival",
    budget: 1000000
  };

  it("menerima payload minimal yang valid", () => {
    const result = eventSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it("meng-coerce budget bertipe string menjadi number", () => {
    const result = eventSchema.safeParse({ ...base, budget: "500000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budget).toBe(500000);
    }
  });

  it("menolak nama event yang terlalu pendek", () => {
    const result = eventSchema.safeParse({ ...base, name: "A" });
    expect(result.success).toBe(false);
  });

  it("menolak budget negatif", () => {
    const result = eventSchema.safeParse({ ...base, budget: -100 });
    expect(result.success).toBe(false);
  });

  it("menerima bannerImageUrl kosong (string literal)", () => {
    const result = eventSchema.safeParse({ ...base, bannerImageUrl: "" });
    expect(result.success).toBe(true);
  });

  it("menolak bannerImageUrl yang bukan URL valid", () => {
    const result = eventSchema.safeParse({ ...base, bannerImageUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

describe("circleSchema", () => {
  it("menerima payload valid", () => {
    const result = circleSchema.safeParse({ name: "Atelier Hanami", slug: "atelier-hanami" });
    expect(result.success).toBe(true);
  });

  it("menolak nama yang terlalu pendek", () => {
    const result = circleSchema.safeParse({ name: "A", slug: "a" });
    expect(result.success).toBe(false);
  });

  it("menolak socialLink yang bukan URL", () => {
    const result = circleSchema.safeParse({
      name: "Atelier Hanami",
      slug: "atelier-hanami",
      socialLink: "bukan-url"
    });
    expect(result.success).toBe(false);
  });
});

describe("floorMapSchema", () => {
  const base = {
    eventId: "11111111-1111-1111-1111-111111111111",
    name: "Hall A",
    width: 1200,
    height: 900
  };

  it("menerima payload valid", () => {
    const result = floorMapSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("menerima hall opsional untuk multi-hall venue (e.g. Hall 8, Hall 9)", () => {
    const result = floorMapSchema.safeParse({ ...base, hall: "Hall 8" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hall).toBe("Hall 8");
    }
  });

  it("menolak eventId yang bukan uuid", () => {
    const result = floorMapSchema.safeParse({ ...base, eventId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("menolak width di bawah minimum (200)", () => {
    const result = floorMapSchema.safeParse({ ...base, width: 50 });
    expect(result.success).toBe(false);
  });

  it("menolak height di atas maksimum (5000)", () => {
    const result = floorMapSchema.safeParse({ ...base, height: 9000 });
    expect(result.success).toBe(false);
  });
});

describe("boothLocationSchema", () => {
  const base = {
    eventId: "11111111-1111-1111-1111-111111111111",
    circleId: "22222222-2222-2222-2222-222222222222",
    floorMapId: "33333333-3333-3333-3333-333333333333",
    boothCode: "A-12",
    posX: 28,
    posY: 44
  };

  it("menerima payload valid", () => {
    const result = boothLocationSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("menolak posX di luar rentang 0-100", () => {
    const result = boothLocationSchema.safeParse({ ...base, posX: 150 });
    expect(result.success).toBe(false);
  });

  it("menolak boothCode kosong", () => {
    const result = boothLocationSchema.safeParse({ ...base, boothCode: "" });
    expect(result.success).toBe(false);
  });

  it("menerima pilihan day DAY_1, DAY_2, atau ALL_DAYS", () => {
    const resultD1 = boothLocationSchema.safeParse({ ...base, day: "DAY_1" });
    expect(resultD1.success).toBe(true);
    if (resultD1.success) {
      expect(resultD1.data.day).toBe("DAY_1");
    }

    const resultDefault = boothLocationSchema.safeParse(base);
    expect(resultDefault.success).toBe(true);
    if (resultDefault.success) {
      expect(resultDefault.data.day).toBe("ALL_DAYS");
    }
  });
});

describe("productSchema", () => {
  const base = {
    eventId: "11111111-1111-1111-1111-111111111111",
    circleId: "22222222-2222-2222-2222-222222222222",
    name: "Summer Illustration Book",
    price: 185000,
    status: "TARGET",
    priority: "HIGH",
    quantity: 1,
    purchaseType: "PO"
  };

  it("menerima payload valid", () => {
    const result = productSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("menolak status di luar enum productStatuses", () => {
    const result = productSchema.safeParse({ ...base, status: "NOT_A_STATUS" });
    expect(result.success).toBe(false);
  });

  it("menolak quantity di atas maksimum (99)", () => {
    const result = productSchema.safeParse({ ...base, quantity: 100 });
    expect(result.success).toBe(false);
  });

  it("menolak quantity di bawah minimum (1)", () => {
    const result = productSchema.safeParse({ ...base, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("menolak purchaseType yang tidak valid", () => {
    const result = productSchema.safeParse({ ...base, purchaseType: "SUBSCRIPTION" });
    expect(result.success).toBe(false);
  });

  it("menerima targetDay, isRush, dan poPickupNotes untuk keperluan Comifuro", () => {
    const result = productSchema.safeParse({
      ...base,
      targetDay: "DAY_1",
      isRush: true,
      poPickupNotes: "Nama: Dipa / WA: 08123456789 / Slot 2"
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetDay).toBe("DAY_1");
      expect(result.data.isRush).toBe(true);
      expect(result.data.poPickupNotes).toBe("Nama: Dipa / WA: 08123456789 / Slot 2");
    }
  });

  it("memberikan default targetDay ALL_DAYS dan isRush false jika tidak diisi", () => {
    const result = productSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetDay).toBe("ALL_DAYS");
      expect(result.data.isRush).toBe(false);
    }
  });
});

describe("quickStatusSchema", () => {
  it("menerima productId dan status valid", () => {
    const result = quickStatusSchema.safeParse({
      productId: "11111111-1111-1111-1111-111111111111",
      status: "PO_OPEN"
    });
    expect(result.success).toBe(true);
  });

  it("menolak status enum yang tidak valid (mencegah cast langsung dari FormData)", () => {
    const result = quickStatusSchema.safeParse({
      productId: "11111111-1111-1111-1111-111111111111",
      status: "INVALID_STATUS"
    });
    expect(result.success).toBe(false);
  });
});

describe("expenseCategorySchema", () => {
  it("menerima payload valid", () => {
    const result = expenseCategorySchema.safeParse({
      name: "Merchandise",
      slug: "merchandise",
      color: "#D46A3A"
    });
    expect(result.success).toBe(true);
  });

  it("menolak color yang terlalu pendek", () => {
    const result = expenseCategorySchema.safeParse({
      name: "Merchandise",
      slug: "merchandise",
      color: "#F"
    });
    expect(result.success).toBe(false);
  });
});

describe("expenseSchema", () => {
  const base = {
    eventId: "11111111-1111-1111-1111-111111111111",
    categoryId: "22222222-2222-2222-2222-222222222222",
    amount: 50000,
    expenseDate: "2026-07-18",
    paymentMethod: "QRIS"
  };

  it("menerima expense actual saja", () => {
    const result = expenseSchema.safeParse({ ...base, isPlanned: false, isActual: true });
    expect(result.success).toBe(true);
  });

  it("menerima expense planned saja", () => {
    const result = expenseSchema.safeParse({ ...base, isPlanned: true, isActual: false });
    expect(result.success).toBe(true);
  });

  it("menolak jika keduanya planned dan actual false (refine)", () => {
    const result = expenseSchema.safeParse({ ...base, isPlanned: false, isActual: false });
    expect(result.success).toBe(false);
  });

  it("menolak amount nol atau negatif", () => {
    const result = expenseSchema.safeParse({ ...base, amount: 0, isActual: true });
    expect(result.success).toBe(false);
  });
});

describe("catalogEntrySchema", () => {
  const eventId = "11111111-1111-1111-1111-111111111111";
  const product = {
    name: "Original Character Acrylic Stand",
    price: 95000,
    status: "TARGET",
    priority: "MEDIUM",
    quantity: 1,
    purchaseType: "ON_THE_SPOT"
  };

  it("menerima circle mode existing dengan minimal 1 produk", () => {
    const result = catalogEntrySchema.safeParse({
      eventId,
      circle: { mode: "existing", id: "22222222-2222-2222-2222-222222222222" },
      products: [product]
    });
    expect(result.success).toBe(true);
  });

  it("menerima circle mode new dengan minimal 1 produk", () => {
    const result = catalogEntrySchema.safeParse({
      eventId,
      circle: { mode: "new", name: "Mikan Press" },
      products: [product]
    });
    expect(result.success).toBe(true);
  });

  it("menolak discriminated union tanpa mode yang valid", () => {
    const result = catalogEntrySchema.safeParse({
      eventId,
      circle: { mode: "unknown" },
      products: [product]
    });
    expect(result.success).toBe(false);
  });

  it("menolak circle mode existing tanpa id uuid", () => {
    const result = catalogEntrySchema.safeParse({
      eventId,
      circle: { mode: "existing" },
      products: [product]
    });
    expect(result.success).toBe(false);
  });

  it("menolak array produk kosong (min 1)", () => {
    const result = catalogEntrySchema.safeParse({
      eventId,
      circle: { mode: "new", name: "Mikan Press" },
      products: []
    });
    expect(result.success).toBe(false);
  });

  it("menolak array produk lebih dari 20 (max 20)", () => {
    const result = catalogEntrySchema.safeParse({
      eventId,
      circle: { mode: "new", name: "Mikan Press" },
      products: Array.from({ length: 21 }, () => product)
    });
    expect(result.success).toBe(false);
  });
});
