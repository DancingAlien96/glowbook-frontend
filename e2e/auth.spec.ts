import { test, expect } from "@playwright/test";
import { goToLoginClean } from "./helpers";

const OWNER_EMAIL = "isabella@maisonrose.app";
const OWNER_PASSWORD = "glowbook123";
const WRONG_PASSWORD = "contraseñaIncorrecta999";

test.describe("Autenticación - Login", () => {
  test.beforeEach(async ({ page }) => {
    await goToLoginClean(page);
  });

  test("muestra el formulario de login correctamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /inicia sesión/i })).toBeVisible();
    await expect(page.getByPlaceholder(/tu@email\.com/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("no permite enviar el formulario sin email", async ({ page }) => {
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    const emailInput = page.getByPlaceholder(/tu@email\.com/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test("muestra error con credenciales incorrectas", async ({ page }) => {
    await page.getByPlaceholder(/tu@email\.com/i).fill(OWNER_EMAIL);
    await page.locator('input[type="password"]').fill(WRONG_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(
      page.locator("div").filter({ hasText: /credencial|contraseña incorrecta|no pudimos|inválid|invalid/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("login exitoso redirige al dashboard", async ({ page }) => {
    await page.getByPlaceholder(/tu@email\.com/i).fill(OWNER_EMAIL);
    await page.locator('input[type="password"]').fill(OWNER_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
  });

  test("usuario autenticado que visita /login es redirigido al dashboard", async ({ page }) => {
    // Login exitoso
    await page.getByPlaceholder(/tu@email\.com/i).fill(OWNER_EMAIL);
    await page.locator('input[type="password"]').fill(OWNER_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });

    // Visitar /login estando autenticado debe redirigir de vuelta al dashboard
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe("Autenticación - Registro", () => {
  test.beforeEach(async ({ page }) => {
    await goToLoginClean(page);
    await page.goto("/register");
  });

  test("muestra el formulario de registro correctamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /crea tu salón/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Isabella Rojas/i)).toBeVisible();
    await expect(page.getByPlaceholder(/tu@email\.com/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByPlaceholder(/Maison Rosé/i)).toBeVisible();
    await expect(page.getByPlaceholder(/maison-rose/i)).toBeVisible();
  });

  test("el slug se genera automáticamente desde el nombre del salón", async ({ page }) => {
    const salonInput = page.getByPlaceholder(/Maison Rosé/i);
    const slugInput = page.getByPlaceholder(/maison-rose/i);

    await salonInput.fill("Salón de Prueba");
    await expect(slugInput).toHaveValue("salon-de-prueba", { timeout: 3000 });
  });

  test("el slug no se sobreescribe si el usuario lo editó manualmente", async ({ page }) => {
    const salonInput = page.getByPlaceholder(/Maison Rosé/i);
    const slugInput = page.getByPlaceholder(/maison-rose/i);

    await slugInput.fill("mi-slug-manual");
    await salonInput.fill("Cualquier Nombre");

    await expect(slugInput).toHaveValue("mi-slug-manual");
  });

  test("muestra error si el email ya está registrado", async ({ page }) => {
    await page.getByPlaceholder(/Isabella Rojas/i).fill("Test User");
    await page.getByPlaceholder(/tu@email\.com/i).fill(OWNER_EMAIL);
    await page.locator('input[type="password"]').fill("testpassword123");
    await page.getByPlaceholder(/Maison Rosé/i).fill("Test Salon");
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(
      page.locator(".text-blush-500").filter({ hasText: /.+/ }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("enlace 'Inicia sesión' lleva a /login", async ({ page }) => {
    await page.getByRole("link", { name: /inicia sesión/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Protección de rutas", () => {
  test("acceder a /dashboard sin sesión redirige a /login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.evaluate(() => localStorage.removeItem("gb.access"));
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
