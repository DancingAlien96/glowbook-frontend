import { test, expect } from "@playwright/test";
import { loginAs, OWNER } from "./helpers";

test.describe("Dashboard - Overview", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, OWNER.email, OWNER.password);
  });

  test("muestra saludo con el nombre del usuario", async ({ page }) => {
    await expect(page.getByText(/hola isabella/i)).toBeVisible({ timeout: 10000 });
  });

  test("muestra las 4 tarjetas de KPI", async ({ page }) => {
    await expect(page.getByText("Citas hoy", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Ingresos semana", { exact: true })).toBeVisible();
    await expect(page.getByText("Pagos por revisar", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/nuevas clientas/i).first()).toBeVisible();
  });

  test("muestra la agenda de hoy", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Agenda de hoy" })).toBeVisible({ timeout: 10000 });
  });

  test("el botón 'Ver calendario' navega a citas", async ({ page }) => {
    await page.getByRole("link", { name: /ver calendario/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/appointments/);
  });
});

test.describe("Dashboard - Navegación", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, OWNER.email, OWNER.password);
  });

  test("puede navegar a Agenda", async ({ page }) => {
    await page.goto("/dashboard/appointments");
    await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible({ timeout: 10000 });
  });

  test("puede navegar a Clientas", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(page.getByRole("heading", { name: "Clientas" })).toBeVisible({ timeout: 10000 });
  });

  test("puede navegar a Servicios", async ({ page }) => {
    await page.goto("/dashboard/services");
    await expect(page.getByRole("heading", { name: "Servicios" })).toBeVisible({ timeout: 10000 });
  });

  test("puede navegar a Equipo", async ({ page }) => {
    await page.goto("/dashboard/team");
    await expect(page.getByRole("heading", { name: "Estilistas & staff" })).toBeVisible({ timeout: 10000 });
  });

  test("puede navegar a Pagos", async ({ page }) => {
    await page.goto("/dashboard/payments");
    await expect(page.getByRole("heading", { name: "Pagos & comprobantes" })).toBeVisible({ timeout: 10000 });
  });

  test("puede navegar a Ajustes", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page.getByRole("heading", { name: "Ajustes del salón" })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Dashboard - Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, OWNER.email, OWNER.password);
  });

  test("el sidebar muestra el nombre del salón", async ({ page }) => {
    await expect(page.getByText("Maison Rosé", { exact: true }).first()).toBeVisible();
  });

  test("puede cerrar sesión desde el sidebar", async ({ page }) => {
    await page.getByRole("button", { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 8000 });
  });
});
