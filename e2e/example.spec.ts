import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";

// Example test for login page navigation
test("should navigate to the login page", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(homePage.pageTitle).toBeVisible();
});
