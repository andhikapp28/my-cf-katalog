import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";
import { deleteTestProductsByPrefix } from "./db-cleanup";

// Prefix + timestamp per run supaya nama produk unik dan test bisa diulang
// (idempotent) tanpa bentrok dengan sisa data run sebelumnya.
const PRODUCT_PREFIX = "E2E Product ";
const RUN_ID = Date.now();
const PRODUCT_NAME = `${PRODUCT_PREFIX}${RUN_ID}`;
const PRODUCT_NAME_EDITED = `${PRODUCT_NAME} Edited`;

test.describe("Admin products CRUD", () => {
  test.afterAll(async () => {
    await deleteTestProductsByPrefix(PRODUCT_PREFIX);
  });

  test("create, edit, lalu delete produk melalui admin panel", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/products");

    // --- Create ---
    await page.getByRole("button", { name: "Add product", exact: true }).click();

    // `locator("section").filter({ has })` juga mencocokkan section pembungkus
    // terluar dari AdminShell (yang ikut memuat heading ini secara tidak
    // langsung), jadi ambil ancestor::section TERDEKAT dari heading itu saja.
    const createSection = page
      .getByRole("heading", { name: "Add product", exact: true })
      .locator("xpath=ancestor::section[1]");
    await expect(createSection).toBeVisible();

    // Label field wajib (mis. "Event", "Product name") merender tanda "*" tanpa
    // spasi (mis. "Event*"), jadi cocokkan tanpa `exact` agar tetap match.
    await createSection.getByLabel("Event").selectOption({ index: 1 });
    await createSection.getByLabel("Circle").selectOption({ index: 1 });
    await createSection.getByLabel("Product name").fill(PRODUCT_NAME);
    await createSection.getByLabel("Price").fill("123400");
    await createSection.getByLabel("Quantity").fill("2");
    await createSection.getByRole("button", { name: "Save product" }).click();

    // Sejak migrasi ke pola `useActionState` (lihat actions/products.ts),
    // `upsertProductAction` TIDAK PERNAH redirect lagi — sukses ditandai toast
    // + `router.refresh()`, BUKAN navigasi ke `?success=...`. URL harus tetap
    // sama persis (regresi kunci: kalau bug hang lama kambuh, ini akan gagal
    // di sini karena toast tidak akan pernah muncul).
    await expect(page.getByText("Produk baru berhasil ditambahkan.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/products$/);

    const productArticle = page.locator("article").filter({ hasText: PRODUCT_NAME }).first();
    await expect(productArticle).toBeVisible();

    // --- Edit ---
    await productArticle.getByRole("button", { name: "Open actions" }).click();
    await productArticle.getByRole("link", { name: "Edit", exact: true }).click();

    const editSection = page
      .getByRole("heading", { name: /^Edit product:/ })
      .locator("xpath=ancestor::section[1]");
    await expect(editSection).toBeVisible();

    await editSection.getByLabel("Product name").fill(PRODUCT_NAME_EDITED);
    await editSection.getByLabel("Price").fill("456700");
    await editSection.getByRole("button", { name: "Save changes" }).click();

    // Sama seperti create: sukses = toast + router.refresh(), tanpa redirect
    // dan tanpa perubahan URL (form edit tetap terbuka di `?edit=<id>`).
    await expect(page.getByText("Produk berhasil disimpan.")).toBeVisible();

    const editedArticle = page.locator("article").filter({ hasText: PRODUCT_NAME_EDITED }).first();
    await expect(editedArticle).toBeVisible();
    await expect(editedArticle.getByText("Rp", { exact: false }).first()).toBeVisible();

    // --- Delete ---
    await editedArticle.getByRole("button", { name: "Open actions" }).click();
    await editedArticle.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByText("Produk dihapus.")).toBeVisible();
    await expect(page.locator("article").filter({ hasText: PRODUCT_NAME_EDITED })).toHaveCount(0);
  });
});
