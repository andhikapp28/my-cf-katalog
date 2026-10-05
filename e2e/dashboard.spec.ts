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

    // 1. Teks Judul & Hero Headline (Struktur palet TANALOKA)
    await expect(page.getByText("WHERE EVERY CREATOR GATHERS")).toBeVisible();
    await expect(page.locator("img[alt='ComiPocket Mascot']")).toBeVisible();
    await expect(page.getByRole("link", { name: "JELAJAHI 1.400+ CIRCLE" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Peta Denah Hall" })).toBeVisible();

    // 2. Metrik Cards (AISUM Pulse & Metrics)
    await expect(page.getByText("EVENT PULSE & METRICS")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /CONVENTION MEETS ACTION/i })).toBeVisible();
    await expect(page.getByText("CIRCLES", { exact: true })).toBeVisible();
    await expect(page.getByText("Artist Alley & Creator Alley")).toBeVisible();
    await expect(page.getByText("SAMPEL KARYA", { exact: true })).toBeVisible();
    await expect(page.getByText("Artbook, Merch, Standee & Zine")).toBeVisible();
    await expect(page.getByText("HALL VENUE", { exact: true })).toBeVisible();
    await expect(page.getByText("Hall 8 & Hall 9 ICE BSD")).toBeVisible();
    await expect(page.getByText("OFFLINE READY", { exact: true })).toBeVisible();
    await expect(page.getByText("Service Worker & Local Storage")).toBeVisible();

    // 3. Banner CF23 - CF18 16:9 Landscape cards & badges
    await expect(page.getByText("COMIFURO EDITIONS & ARCHIVES")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "COMIFURO EDITIONS" })).toBeVisible();
    await expect(page.getByRole("link", { name: "LIHAT SEMUA CIRCLE" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SEMUA EVENT" })).toBeVisible();

    const editions = [
      { id: "CF 23", name: "Comic Frontier 23" },
      { id: "CF 22", name: "Comic Frontier 22" },
      { id: "CF 21", name: "Comic Frontier 21" },
      { id: "CF 20", name: "Comic Frontier 20" },
      { id: "CF 19", name: "Comic Frontier 19" },
      { id: "CF 18", name: "Comic Frontier 18" }
    ];

    for (const edition of editions) {
      await expect(page.getByText(edition.name, { exact: true })).toBeVisible();
      await expect(page.getByText(edition.id, { exact: true }).first()).toBeVisible();
    }

    // Memastikan kartu banner menggunakan aspek rasio 16:9
    const aspect169Banners = page.locator(".aspect-\\[16\\/9\\]");
    await expect(aspect169Banners).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(aspect169Banners.nth(i)).toBeVisible();
    }

    // 4. Footer (TANALOKA Design System)
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(
      footer.getByText(/Katalog personal, denah booth ICE BSD, checklist belanja/i)
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Andhika Putra Pratama" })
    ).toBeVisible();
    await expect(
      footer.getByText(/Built with Next\.js, Drizzle & PostgreSQL/i)
    ).toBeVisible();
    await expect(
      footer.getByText("COMIPOCKET", { exact: true })
    ).toBeVisible();
    await expect(
      footer.getByText(/© 2026 ComiPocket\. Comic Frontier Companion Guide\./i)
    ).toBeVisible();

    expect(pageErrors, `Terjadi uncaught error di halaman: ${pageErrors.join("; ")}`).toEqual([]);
    expect(consoleErrors, `Terjadi console.error di halaman: ${consoleErrors.join("; ")}`).toEqual([]);
  });

  test("halaman produk publik bisa dibuka tanpa autentikasi", async ({ page }) => {
    const response = await page.goto("/products");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("body")).toBeVisible();
  });
});
