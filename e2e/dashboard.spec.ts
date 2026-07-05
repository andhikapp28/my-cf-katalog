import { test, expect } from "@playwright/test";

test.describe("Public dashboard", () => {
  test("halaman utama menampilkan event aktif tanpa error console", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    // Elemen kunci dashboard: badge status event, budget pulse, dan ringkasan spend.
    await expect(page.getByText(/Active Event|Upcoming Event|Featured Event/)).toBeVisible();
    await expect(page.getByText("Budget pulse")).toBeVisible();
    // `exact: true` karena getByText default-nya case-insensitive substring match,
    // dan "Target Items" cocok juga dengan heading "Top target items" di bawahnya.
    // "Budget Left" muncul dua kali (kartu ringkasan desktop + bottom-bar mobile),
    // jadi pakai `.first()` alih-alih strict single-match.
    await expect(page.getByText("Target Items", { exact: true })).toBeVisible();
    await expect(page.getByText("Estimated Spend", { exact: true })).toBeVisible();
    await expect(page.getByText("Actual Spend", { exact: true })).toBeVisible();
    await expect(page.getByText("Budget Left", { exact: true }).first()).toBeVisible();

    expect(pageErrors, `Terjadi uncaught error di halaman: ${pageErrors.join("; ")}`).toEqual([]);
    expect(consoleErrors, `Terjadi console.error di halaman: ${consoleErrors.join("; ")}`).toEqual([]);
  });

  test("halaman produk publik bisa dibuka tanpa autentikasi", async ({ page }) => {
    const response = await page.goto("/products");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("body")).toBeVisible();
  });
});
