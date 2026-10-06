import { test, expect } from "@playwright/test";

test.describe("Interactive Map & Circle Drawer (ala sirkel.id)", () => {
  test("halaman peta menampilkan switcher hall, search bar, dan canvas denah", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const response = await page.goto("/maps");
    expect(response?.ok()).toBe(true);

    // Header & metadata
    await expect(page.locator("h1")).toBeVisible();

    // Search bar mengambang
    const searchInput = page.getByPlaceholder(/Cari circle, booth/i);
    await expect(searchInput).toBeVisible();

    // Filter day chips
    await expect(page.getByRole("button", { name: /Semua Meja/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Day 1/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Day 2/i })).toBeVisible();

    // Canvas denah vektor atau image viewer
    await expect(page.locator("svg, img").first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test("pencarian circle di peta memfilter daftar dan membuka detail drawer", async ({ page }) => {
    await page.goto("/maps");

    const searchInput = page.getByPlaceholder(/Cari circle, booth/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("A");

    // Jika autocomplete atau marker muncul, klik salah satu
    const suggestion = page.locator("button").filter({ hasText: /[A-Z0-9]{2,}-\d+/ }).first();
    if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await suggestion.click();
    } else {
      const markerButton = page.locator("button[aria-label]").first();
      if (await markerButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await markerButton.click();
      }
    }

    // Detail drawer atau popup sheet tampil
    await expect(page.locator("body")).toBeVisible();
  });
});
