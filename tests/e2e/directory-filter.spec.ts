import { expect, test } from "@playwright/test";

test.describe("Schools Directory & Filter Critical Flow", () => {
  test("renders schools directory, displays school cards, and navigates to profile", async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.goto("/schools");

    // Check directory header
    await expect(page).toHaveTitle(/Schools Directory/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /Schools Directory/i }),
    ).toBeVisible();

    // Verify school cards are rendered by checking view profile buttons
    const viewProfileButtons = page.getByRole("link", {
      name: /View School Profile/i,
    });
    await expect(viewProfileButtons.first()).toBeVisible();

    // Click first school profile link
    await viewProfileButtons.first().click();

    // Verify navigation to school profile page
    await expect(page).toHaveURL(/.*\/schools\/.+/, { timeout: 30000 });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30000,
    });
  });

  test("filters schools interactively via search query", async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(60000);

    await page.goto("/schools");

    // On mobile viewports, open the Filters sheet first
    if (isMobile) {
      const mobileFilterBtn = page
        .getByRole("button", { name: /Filters/i })
        .first();
      await mobileFilterBtn.click();

      const searchInput = page
        .locator("#mobile-school-search-input")
        .or(page.getByRole("dialog").getByPlaceholder(/Name, street, keyword/i))
        .first();
      await searchInput.fill("Greenoak");

      // Close the sheet drawer to view results
      await page.getByRole("button", { name: /Apply Filters/i }).click();
    } else {
      const searchInput = page
        .locator("#desktop-school-search-input")
        .or(page.getByPlaceholder(/Name, street, keyword/i))
        .first();
      await searchInput.fill("Greenoak");
    }

    // Verify Greenoak International School appears
    await expect(
      page.getByText(/Greenoak International School/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
