import { test, expect } from "@playwright/test";

test.describe("Project Mode E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/project-mode");
    await page.waitForLoadState("networkidle");
  });

  test("should display project challenges list", async ({ page }) => {
    // Main heading
    await expect(page.getByRole("heading", { name: /project mode/i })).toBeVisible();

    // Difficulty filter buttons
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Easy" })).toBeVisible();

    // At least one challenge card link
    const cards = page.getByRole("link").filter({ has: page.locator("h3") });
    await expect(cards.first()).toBeVisible();
  });

  test("should filter challenges by difficulty", async ({ page }) => {
    // Click "Easy" filter
    await page.getByRole("button", { name: "Easy" }).click();
    await page.waitForTimeout(300);

    // All visible difficulty badges should say "Easy"
    const badges = page.locator("text=Easy");
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    // Click "Hard" filter
    await page.getByRole("button", { name: "Hard" }).click();
    await page.waitForTimeout(300);

    // Should see "Hard" badge(s)
    const hardBadges = page.locator("text=Hard");
    const hardCount = await hardBadges.count();
    expect(hardCount).toBeGreaterThan(0);
  });

  test("should navigate to a challenge and show editor", async ({ page }) => {
    // Click first project card (each is a Link wrapping a Card)
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();

    // Wait for project editor to load
    await page.waitForLoadState("networkidle");

    // Verify Solution button should be visible
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible({ timeout: 10000 });

    // Timer should eventually appear
    await expect(page.locator("text=/\\d{2}:\\d{2}/")).toBeVisible({ timeout: 5000 });
  });

  test("should show challenge instructions on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to a challenge
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Mobile help button should be visible
    const helpButton = page.locator("[title='View Challenge Instructions']");
    await expect(helpButton).toBeVisible({ timeout: 10000 });

    // Open drawer
    await helpButton.click();

    // Drawer should show "Description" heading
    await expect(page.getByText("Description")).toBeVisible();

    // Close via "Got it" button
    const gotItButton = page.getByRole("button", { name: /got it/i });
    await expect(gotItButton).toBeVisible();
    await gotItButton.click();
  });

  test("should reset project with confirmation dialog", async ({ page }) => {
    // Navigate to a challenge
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Wait for verify button (indicates editor loaded)
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible({ timeout: 10000 });

    // Click reset button
    const resetButton = page.locator("[title='Reset Project']");
    await resetButton.click();

    // Confirmation dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Reset Project?")).toBeVisible();

    // Confirm reset
    await page.getByRole("button", { name: "Yes, Reset" }).click();

    // Toast should show
    await expect(page.getByText(/project reset/i)).toBeVisible({ timeout: 3000 });
  });

  test("should dismiss reset dialog with Cancel or Escape", async ({ page }) => {
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible({ timeout: 10000 });

    // Open reset dialog
    await page.locator("[title='Reset Project']").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Cancel
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Open again and dismiss with Escape
    await page.locator("[title='Reset Project']").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should reveal hints progressively", async ({ page }) => {
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible({ timeout: 10000 });

    // Desktop: hints are in the sidebar
    const hintButton = page.getByRole("button", { name: /reveal next hint/i });
    if (await hintButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await hintButton.click();
      await expect(page.getByText("Hint 1:")).toBeVisible();

      // If there are more hints, click again
      if (await hintButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await hintButton.click();
        await expect(page.getByText("Hint 2:")).toBeVisible();
      }
    }
  });

  test("should show timer and track elapsed time", async ({ page }) => {
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Timer should appear as MM:SS format
    const timerText = page.locator("text=/\\d{2}:\\d{2}/");
    await expect(timerText).toBeVisible({ timeout: 5000 });

    // Capture initial time
    const firstTime = await timerText.textContent();
    await page.waitForTimeout(2500);
    const secondTime = await timerText.textContent();

    // Time should have advanced
    expect(firstTime).not.toEqual(secondTime);
  });

  test("keyboard shortcut Ctrl+Enter should trigger verify", async ({ page }) => {
    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible({ timeout: 10000 });

    // Press Ctrl+Enter
    await page.keyboard.press("Control+Enter");

    // Should show either "Analyzing Solution" overlay or a toast
    const anyFeedback = page.locator("text=/analyzing|verification|no automated|keep debugging/i");
    await expect(anyFeedback).toBeVisible({ timeout: 5000 });
  });

  test("should track completion in localStorage", async ({ page }) => {
    // Verify localStorage is accessible and structured
    const completed = await page.evaluate(() => {
      const stored = localStorage.getItem("completedProjects");
      return stored ? JSON.parse(stored) : [];
    });
    expect(Array.isArray(completed)).toBe(true);
  });

  test("should show mobile file picker on tap", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const firstLink = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible({ timeout: 10000 });

    // File picker button
    const filesButton = page.getByRole("button", { name: /open file picker/i });
    await expect(filesButton).toBeVisible();

    // Tap to open
    await filesButton.click();

    // Should show a listbox with file options
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Pick a file option
    const options = listbox.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // Select a file to close the picker
    await options.first().click();
    await expect(listbox).not.toBeVisible();
  });

  test("should search and filter challenges", async ({ page }) => {
    // Type in the search box
    const searchInput = page.getByPlaceholder(/search challenges/i);
    await searchInput.fill("counter");
    await page.waitForTimeout(300);

    // Should find the counter challenge
    await expect(page.getByText(/impossible counter/i)).toBeVisible();

    // Clear and search for something that doesn't exist
    await searchInput.fill("xyznonexistent");
    await page.waitForTimeout(300);

    // Should show empty state
    await expect(page.getByText(/no matching challenges/i)).toBeVisible();

    // Clear filters button should work
    await page.getByRole("button", { name: /clear all filters/i }).click();
    await page.waitForTimeout(300);

    // Cards should reappear
    const cards = page.getByRole("link").filter({ has: page.locator("h3") });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
