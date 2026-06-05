import { Page } from "@playwright/test";

export const OWNER = {
  email: "isabella@maisonrose.app",
  password: "glowbook123",
  name: "Isabella Rojas",
};

export const ADMIN = {
  email: "admin@ecodama.online",
  password: "glowbook123",
};

/**
 * Deja el browser completamente sin sesión y aterriza en /login.
 * Orden: clearCookies (mata refresh token) → goto /login →
 * removeItem (mata access token) → goto /login de nuevo
 * (esta segunda navegación ya no tiene credentials → se queda en /login).
 */
export async function goToLoginClean(page: Page) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.evaluate(() => localStorage.removeItem("gb.access"));
  await page.goto("/login");
}

/** Inicia sesión como un usuario dado y espera que el dashboard cargue. */
export async function loginAs(page: Page, email: string, password: string) {
  await goToLoginClean(page);
  await page.getByPlaceholder(/tu@email\.com/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
}
