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

    // Elemen kunci landing page: banner event aktif, hero headline, infograph pulse metrics, banner section
    await expect(page.getByText("COMIPOCKET GUIDE")).toBeVisible();
    await expect(page.getByText("COMIC FRONTIER 22", { exact: true })).toBeVisible();
    await expect(page.getByText("HALL 8 & 9", { exact: true })).toBeVisible();

    const heroHeading = page.getByRole("heading", { level: 1 });
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("HUNTING");
    await expect(heroHeading).toContainText("COMIFURO");
    await expect(heroHeading).toContainText("TANPA MATI SINYAL");

    await expect(page.getByText("MASCOT STAGE")).toBeVisible();

    await expect(page.getByText("EVENT PULSE & METRICS")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /CONVENTION MEETS ACTION/i })).toBeVisible();
    await expect(page.getByText("CIRCLES", { exact: true })).toBeVisible();
    await expect(page.getByText("SAMPEL KARYA", { exact: true })).toBeVisible();
    await expect(page.getByText("HALL VENUE", { exact: true })).toBeVisible();
    await expect(page.getByText("OFFLINE READY", { exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: "COMIFURO 22 CIRCLES & EDITIONS" })).toBeVisible();
    await expect(page.getByText("Comic Frontier 23", { exact: true })).toBeVisible();
    await expect(page.getByText("Comic Frontier 22", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "LIHAT SEMUA CIRCLE" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SEMUA EVENT" })).toBeVisible();

    expect(pageErrors, `Terjadi uncaught error di halaman: ${pageErrors.join("; ")}`).toEqual([]);
    expect(consoleErrors, `Terjadi console.error di halaman: ${consoleErrors.join("; ")}`).toEqual([]);
  });

  test("halaman produk publik bisa dibuka tanpa autentikasi", async ({ page }) => {
    const response = await page.goto("/products");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("body")).toBeVisible();
  });
});
