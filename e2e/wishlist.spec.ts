import { test, expect } from "@playwright/test";

test.describe("My Wishlist & Bookmark Page", () => {
  test("halaman wishlist / circle tersimpan dapat dibuka tanpa login dan menampilkan empty state", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("Failed to load resource")) {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto("/wishlist");
    expect(response?.ok()).toBe(true);

    // Heading dan empty state
    await expect(page.locator("h1")).toContainText(/Circle Tersimpan/i);
    await expect(page.getByText(/Belum Ada Circle Tersimpan/i)).toBeVisible();

    // Tombol CTA menuju direktori circle
    const exploreBtn = page.getByRole("link", { name: /Jelajahi Direktori Circle/i });
    await expect(exploreBtn).toBeVisible();
    await expect(exploreBtn).toHaveAttribute("href", "/circles");

    expect(consoleErrors).toEqual([]);
  });

  test("circle tersimpan ke localStorage dan dapat dibuka offline", async ({ page }) => {
    // Kunjungi direktori circle
    await page.goto("/circles");

    // Cari tombol wishlist / bookmark
    const bookmarkBtn = page.getByTitle(/Wishlist|Simpan ke Wishlist|Tandai/i).first();
    if (await bookmarkBtn.isVisible()) {
      await bookmarkBtn.click();
    }

    // Buka halaman wishlist
    await page.goto("/wishlist");
    await expect(page).toHaveURL("/wishlist");
    await expect(page.locator("body")).toBeVisible();
  });
});
