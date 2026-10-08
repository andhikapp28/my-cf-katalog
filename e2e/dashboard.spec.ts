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
    await expect(page.getByRole("link", { name: "JELAJAHI 1.400+ CIRCLE", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Peta Denah Hall", exact: true })).toBeVisible();

    // 2. Metrik Cards (AISUM Pulse & Metrics)
    await expect(page.getByText("COMIFURO 22 · DATA EVENT AKTIF")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /CONVENTION MEETS ACTION/i })).toBeVisible();
    await expect(page.getByText("CIRCLES", { exact: true })).toBeVisible();
    await expect(page.getByText("Artist Alley & Creator Alley")).toBeVisible();
    await expect(page.getByText("SAMPEL KARYA", { exact: true })).toBeVisible();
    await expect(page.getByText("Artbook, Merch, Standee & Zine")).toBeVisible();
    await expect(page.getByText("HALL VENUE", { exact: true })).toBeVisible();
    await expect(page.getByText("Hall 8 & Hall 9 ICE BSD", { exact: true })).toBeVisible();
    await expect(page.getByText("OFFLINE READY", { exact: true })).toBeVisible();
    await expect(page.getByText("Service Worker & Local Storage")).toBeVisible();

    // 3. Banner CF23 - CF18 16:9 Landscape cards, badges, real images & action routes
    await expect(page.getByRole("heading", { level: 2, name: "COMIFURO EDITIONS" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SEMUA CIRCLE" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SEMUA CIRCLE" })).toHaveAttribute("href", "/circles");
    await expect(page.getByRole("link", { name: "SEMUA EVENT" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SEMUA EVENT" })).toHaveAttribute("href", "/events");

    const editions = [
      { id: "CF 23", name: "Comic Frontier 23", image: "/banner/cf23.jpg", route: "/events/cf23" },
      { id: "CF 22", name: "Comic Frontier 22", image: "/banner/cf22.jpg", route: "/events/cf22" },
      { id: "CF 21", name: "Comic Frontier 21", image: "/banner/cf21.jpg", route: "/events/cf21" },
      { id: "CF 20", name: "Comic Frontier 20", image: "/banner/cf20.jpg", route: "/events/cf20" },
      { id: "CF 19", name: "Comic Frontier 19", image: "/banner/cf19.jpg", route: "/events/cf19" },
      { id: "CF 18", name: "Comic Frontier 18", image: "/banner/cf18.jpg", route: "/events/cf18" }
    ];

    for (const edition of editions) {
      const editionCard = page.locator("article").filter({ hasText: edition.name });
      await expect(page.getByText(edition.name, { exact: true })).toBeVisible();
      await expect(page.getByText(edition.id, { exact: true }).first()).toBeVisible();

      // Verifikasi keberadaan elemen gambar banner asli Comifuro
      const bannerImg = editionCard.locator(`img[alt="${edition.name}"]`);
      await expect(bannerImg).toBeVisible();
      await expect(bannerImg).toHaveAttribute("src", edition.image);

      // Verifikasi rute aksi interaktif 16:9 kartu banner
      const actionLink = editionCard.locator("a");
      await expect(actionLink).toBeVisible();
      await expect(actionLink).toHaveAttribute("href", edition.route);
    }

    // Memastikan kartu banner menggunakan aspek rasio 16:9
    const aspect169Banners = page.locator(".aspect-\\[16\\/9\\]");
    await expect(aspect169Banners).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(aspect169Banners.nth(i)).toBeVisible();
    }

    // 4. Companion Toolkit & 3-Step Hunting Flow
    await expect(page.getByRole("heading", { name: /COMPANION TOOLKIT/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /3-STEP CONVENTION HUNTING FLOW/i })).toBeVisible();

    // 5. Footer (TANALOKA Design System)
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(
      footer.getByText(/Katalog personal, denah booth ICE BSD, checklist belanja/i)
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Andhika Putra Pratama" })
    ).toBeVisible();
    await expect(
      footer.getByText(/PWA Companion & Offline Catalog/i)
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

  test("halaman produk publik bisa dibuka tanpa autentikasi dan menampilkan filter serta katalog", async ({ page }) => {
    const response = await page.goto("/products");
    expect(response?.ok()).toBe(true);

    // Heading katalog TANALOKA
    await expect(
      page.getByRole("heading", { level: 1, name: /DIREKTORI CIRCLE & KATALOG KARYA COMIFURO/i })
    ).toBeVisible();

    // Input filter & pencarian terpadu
    await expect(page.getByPlaceholder(/Cari nama circle/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /CARI/i })).toBeVisible();

    // Filter chips hari
    await expect(page.getByRole("link", { name: /SEMUA HARI/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /DAY 1/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /DAY 2/i })).toBeVisible();
  });

  test("kartu banner 16:9 Comifuro dapat dinavigasi ke rute tujuan yang benar", async ({ page }) => {
    await page.goto("/");

    // Navigasi lewat banner 16:9 CF 22 ke rute /events/cf22
    const cf22Card = page.locator("article").filter({ hasText: "Comic Frontier 22" });
    const cardLink = cf22Card.locator("a");
    await expect(cardLink).toBeVisible();
    await cardLink.click();

    await expect(page).toHaveURL(/\/events\/cf22/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Comic Frontier 22/i })
    ).toBeVisible();
  });
});
