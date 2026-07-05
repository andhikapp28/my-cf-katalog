import { test, expect } from "@playwright/test";
import { getAdminCredentials, loginAsAdmin } from "./helpers";

test.describe("Admin login", () => {
  test("login dengan kredensial valid redirect ke /admin dan sesi admin aktif", async ({ page }) => {
    await loginAsAdmin(page);

    // Sesi admin aktif ditandai dengan email admin muncul di sidebar AdminShell.
    const { email } = getAdminCredentials();
    await expect(page.getByText(email, { exact: false })).toBeVisible();

    // Route admin lain juga harus bisa diakses tanpa dilempar balik ke /admin/login.
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/products$/);
  });

  test("login dengan password salah menampilkan pesan error dan tetap di halaman login", async ({ page }) => {
    const { email } = getAdminCredentials();

    await page.goto("/admin/login");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("password-salah-pasti");
    await page.getByRole("button", { name: "Masuk ke admin panel" }).click();

    await expect(page.getByText("Email atau password tidak valid.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("mengakses /admin tanpa login redirect ke /admin/login", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/admin");
    // NextAuth menambahkan query `callbackUrl` pada redirect, jadi tidak boleh
    // anchor akhir string (`$`) tepat setelah "/admin/login".
    await expect(page).toHaveURL(/\/admin\/login(\?|$)/);
  });
});
