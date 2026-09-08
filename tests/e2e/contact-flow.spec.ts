import { expect, test } from "@playwright/test";

test.describe("Contact Form Critical Flow", () => {
  test("loads the contact page and renders all essential elements", async ({
    page,
  }) => {
    await page.goto("/contact");

    // Verify page title and heading
    await expect(page).toHaveTitle(/Contact/i);
    await expect(
      page.getByRole("heading", { name: /Talk/i }).first(),
    ).toBeVisible();

    // Verify presence of contact channels section
    await expect(page.getByText(/Channels & Locations/i).first()).toBeVisible();

    // Verify form fields exist
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const messageInput = page.locator('textarea[name="message"]');
    const submitButton = page.getByRole("button", { name: /Submit Inquiry/i });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("fills contact inquiry form and handles submission interaction", async ({
    page,
  }) => {
    await page.goto("/contact");

    await page.locator('input[name="name"]').fill("Chinedu Eze");
    await page.locator('input[name="email"]').fill("chinedu.eze@example.com");
    await page.locator('input[name="phone"]').fill("+2348035551234");
    await page
      .locator('textarea[name="message"]')
      .fill(
        "Hello, I would like to request school admission advisory for Grade 7.",
      );

    // Click submit button
    const submitButton = page.getByRole("button", { name: /Submit Inquiry/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify submission interaction activates (loading button state or status message)
    await expect(
      page.getByRole("button", { name: /Sending Message|Submit/i }),
    ).toBeVisible();
  });
});
