import { test, expect } from "@playwright/test";

// La landing muestra links distintos si el usuario está autenticado.
// Siempre limpiamos la sesión para probar el estado no autenticado.
test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("gb.access"));
    await page.goto("/");
    // Esperar a que el navbar muestre los links de auth (estado anónimo)
    await expect(page.getByRole("link", { name: "Iniciar sesión" }).first()).toBeVisible({ timeout: 8000 });
  });

  test("carga correctamente con navbar y sección hero", async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("nav").first()).toBeVisible();
    const hero = page.locator("main h1, main h2").first();
    await expect(hero).toBeVisible();
  });

  test("el navbar tiene enlaces a login y registro", async ({ page }) => {
    const nav = page.locator("nav").first();
    await expect(nav.getByRole("link", { name: "Iniciar sesión" }).first()).toBeVisible();
    await expect(nav.getByRole("link", { name: "Comenzar" }).first()).toBeVisible();
  });

  test("puede navegar a /login desde el navbar", async ({ page }) => {
    await page.locator("nav").first().getByRole("link", { name: "Iniciar sesión" }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /inicia sesión/i })).toBeVisible();
  });

  test("el navbar contiene el link de registro y /register carga", async ({ page }) => {
    // Verificar que el link existe con el href correcto
    const registerLink = page.locator('header a[href="/register"]').first();
    await expect(registerLink).toBeVisible();
    const href = await registerLink.getAttribute("href");
    expect(href).toBe("/register");
    // Navegar y verificar que la página de registro carga correctamente
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /crea tu salón/i })).toBeVisible();
  });

  test("las secciones principales son visibles", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await expect(page.locator("footer")).toBeVisible();
  });
});
