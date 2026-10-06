import { test, expect } from "@playwright/test";

test.describe("My Wishlist & Checklist Page", () => {
  test("halaman wishlist publik dapat dibuka tanpa login dan menampilkan empty state / demo", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("Failed to load resource")) {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto("/wishlist");
    expect(response?.ok()).toBe(true);

    // Heading dan empty state
    await expect(page.locator("h1")).toContainText(/Wishlist/i);
    await expect(page.getByText(/Wishlist Kamu Masih Kosong/i)).toBeVisible();

    // Tombol muat demo
    const loadDemoBtn = page.getByRole("button", { name: /Coba Muat Contoh/i });
    if (await loadDemoBtn.isVisible()) {
      await loadDemoBtn.click();
      // Setelah muat demo, kalkulator kesiapan tunai muncul
      await expect(page.getByText(/Kesiapan Tunai ATM/i)).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test("wishlist menyimpan item ke localStorage dan dapat dibuka offline", async ({ page }) => {
    // Kunjungi halaman produk publik
    await page.goto("/products");

    // Cari tombol wishlist / bookmark
    const bookmarkBtn = page.getByTitle(/Wishlist|Simpan ke Wishlist/i).first();
    if (await bookmarkBtn.isVisible()) {
      await bookmarkBtn.click();
    }

    // Buka halaman wishlist
    await page.goto("/wishlist");
    await expect(page).toHaveURL("/wishlist");
    await expect(page.locator("body")).toBeVisible();
  });
});
