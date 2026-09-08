import { expect, test } from "@playwright/test";

test.describe("Admin Authentication & Security E2E", () => {
  test("renders admin login portal with email and password fields", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await expect(page).toHaveTitle(/PortHarcourtSchools/i);
    await expect(
      page.getByRole("heading", { name: /Sign In/i }).first(),
    ).toBeVisible();

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    const submitButton = page.getByRole("button", {
      name: /Sign In to Admin/i,
    });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("rejects invalid login credentials with accessible error feedback", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page
      .locator('input[type="email"], input[name="email"]')
      .fill("unauthorized@example.com");
    await page
      .locator('input[type="password"], input[name="password"]')
      .fill("WrongPassword123!");

    const submitButton = page.getByRole("button", {
      name: /Sign In to Admin/i,
    });
    await submitButton.click();

    // Verify error alert or invalid credentials message appears
    await expect(
      page
        .locator('form [role="alert"]')
        .or(page.locator("div.text-\\[\\#C0392B\\]"))
        .or(page.getByText(/Invalid credentials|Unauthorized/i)),
    ).toBeVisible({ timeout: 10000 });
  });
});
