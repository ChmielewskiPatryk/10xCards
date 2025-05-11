import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";

// Basic login page test
test("basic login page test", async ({ page }) => {
  await page.goto("/auth/login", { waitUntil: "networkidle" });
  const homePage = new HomePage(page);
  await expect(homePage.pageTitle).toBeVisible({ timeout: 10000 });
});
