import { expect, test } from "@playwright/test";

test.describe("Responsive Navigation & Accessibility E2E", () => {
  test("accessibility skip link focuses and targets main content", async ({
    page,
  }) => {
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: /Skip to main content/i });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    expect(await skipLink.getAttribute("href")).toBe("#main-content");

    // Press Enter to navigate to main landmark
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("renders desktop navigation links on wide viewports", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Desktop only test");

    await page.goto("/");

    // Verify desktop header navigation
    const nav = page.getByRole("banner");
    await expect(nav).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Schools Directory", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Blog", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Events & Programmes", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "About Us", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Contact", exact: true }),
    ).toBeVisible();
  });

  test("renders bottom tab navigation and opens More drawer on mobile", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile only test");

    await page.goto("/");

    // Verify mobile bottom tab bar
    const bottomNav = page.getByRole("navigation", {
      name: "Mobile Navigation",
    });
    await expect(bottomNav).toBeVisible({ timeout: 15000 });

    // Click More button in bottom tab bar
    const moreBtn = page
      .getByRole("button", { name: /More/i })
      .or(page.getByRole("button", { name: /Open menu/i }))
      .first();
    await expect(moreBtn).toBeVisible({ timeout: 10000 });
    await moreBtn.click();

    // Verify More Drawer opens with Menu & Resources header and close button
    await expect(page.getByText("Menu & Resources")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible({
      timeout: 10000,
    });
  });
});
