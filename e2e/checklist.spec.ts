import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";
import { deleteTestProductsByPrefix } from "./db-cleanup";

// Prefix + timestamp per run supaya idempotent, sama seperti products-crud.spec.ts.
const PRODUCT_PREFIX = "E2E Checklist ";
const RUN_ID = Date.now();
const PRODUCT_NAME = `${PRODUCT_PREFIX}${RUN_ID}`;

test.describe("Checklist mode", () => {
  test.afterAll(async () => {
    await deleteTestProductsByPrefix(PRODUCT_PREFIX);
  });

  test("tap quick action mengubah status TANPA redirect/reload halaman", async ({ page }) => {
    await loginAsAdmin(page);

    // Siapkan satu produk uji lewat form Add Product yang sudah ada (tidak
    // diubah di Sprint 3), supaya muncul di daftar checklist.
    await page.goto("/admin/products");
    await page.getByRole("button", { name: "Add product", exact: true }).click();
    const createSection = page
      .getByRole("heading", { name: "Add product", exact: true })
      .locator("xpath=ancestor::section[1]");
    await createSection.locator("select[name='eventId']").selectOption({ index: 1 });
    const selectedEventId = await createSection.locator("select[name='eventId']").inputValue();
    await createSection.locator("select[name='circleId']").selectOption({ index: 1 });
    await createSection.getByLabel("Product name").fill(PRODUCT_NAME);
    await createSection.getByLabel("Price").fill("50000");
    await createSection.getByLabel("Quantity").fill("1");
    await createSection.getByRole("button", { name: "Save product" }).click();
    // upsertProductAction sudah dimigrasi ke useActionState (tanpa redirect) —
    // sukses ditandai toast, bukan navigasi. Lihat products-crud.spec.ts.
    await expect(page.getByText("Produk baru berhasil ditambahkan.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/products$/);

    // --- Checklist mode ---
    await page.goto(`/admin/checklist?event=${selectedEventId}`);

    const card = page.locator("article").filter({ hasText: PRODUCT_NAME }).first();
    await expect(card).toBeVisible();
    await expect(card.getByText("TARGET", { exact: true })).toBeVisible();

    const urlBeforeTap = page.url();

    // Tap "Buka PO" (transisi TARGET -> PO_OPEN). Ini SENGAJA dites, bukan
    // "Tandai dibeli", supaya jelas menguji quickUpdateProductStatusAction
    // (dipakai mode checklist) alih-alih flow lain.
    await card.getByRole("button", { name: "Buka PO" }).click();

    // Regresi kunci Sprint 3 Prioritas 0: setelah tap, TIDAK ADA redirect ke
    // pathname yang sama (mis. lewat ?success=...) — status ter-update lewat
    // useOptimistic + Server Action yang mengembalikan state, bukan redirect.
    // Timeout pendek disengaja: kalau bug lama (hang production) kambuh lagi
    // di alur ini, ini akan gagal cepat & jelas alih-alih menunggu lama.
    await expect(card.getByText("PO_OPEN", { exact: true })).toBeVisible({ timeout: 5000 });
    expect(page.url()).toBe(urlBeforeTap);
    expect(page.url()).not.toContain("success=");
    expect(page.url()).not.toContain("error=");

    // Tap "Tandai dibeli" (PO_OPEN -> PURCHASED). Item lalu hilang dari
    // filter default (checklist hanya menampilkan status aktif).
    await card.getByRole("button", { name: "Tandai dibeli" }).click();
    await expect(page.locator("article").filter({ hasText: PRODUCT_NAME })).toHaveCount(0, { timeout: 5000 });
    expect(page.url()).toBe(urlBeforeTap);
  });
});
