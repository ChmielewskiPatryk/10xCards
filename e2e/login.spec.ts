import { test, expect } from "@playwright/test";

test.describe("Login functionality", () => {
  const username = process.env.E2E_USERNAME || "test@example.com";
  const password = process.env.E2E_PASSWORD || "testpassword";

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto("/auth/login");
  });

  test("login page loads correctly", async ({ page }) => {
    // Verify login form elements are present
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();

    // Check that navigation links are present
    await expect(page.getByTestId("forgot-password-link")).toBeVisible();
    await expect(page.getByTestId("register-link")).toBeVisible();
  });

  test("shows validation errors for invalid inputs", async ({ page }) => {
    // Focus on inputs first and then unfocus them to trigger validation
    await page.getByTestId("email-input").click();
    await page.getByTestId("password-input").click();

    // Click outside to unfocus
    await page.click("h1");

    // Submit the form to trigger validation
    await page.getByTestId("login-button").click();

    // Add a longer timeout for error selectors
    await expect(async () => {
      const emailErrorVisible = await page.getByTestId("email-error").isVisible();
      const passwordErrorVisible = await page.getByTestId("password-error").isVisible();
      expect(emailErrorVisible).toBeTruthy();
      expect(passwordErrorVisible).toBeTruthy();
    }).toPass({ timeout: 5000 });
  });

  test("successfully logs in with valid credentials", async ({ page }) => {
    // Fill the form with valid credentials
    await page.getByTestId("email-input").fill(username);
    await page.getByTestId("password-input").fill(password);

    // Submit the form
    await page.getByTestId("login-button").click();

    // Wait for redirect to home page after successful login
    await page.waitForURL("");

    // Additional checks could verify elements only visible to logged-in users
    // For example, check for user profile link or logout button
  });

  test("shows error message with invalid credentials", async ({ page }) => {
    // Fill form with invalid credentials
    await page.getByTestId("email-input").fill("valid@example.com");
    await page.getByTestId("password-input").fill("wrongpassword12345");

    // Submit the form
    await page.getByTestId("login-button").click();

    // // Wait for the response from the server
    await page.waitForTimeout(1000);

    // Check for error message
    await expect(page.getByTestId("login-error")).toBeVisible();
  });
});
