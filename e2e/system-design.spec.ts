import { test, expect } from '@playwright/test';

test.describe('System Design Canvas', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the system design page
        await page.goto('/system-design');
        // Wait for the canvas to be visible
        await page.waitForSelector('#sd-canvas');
    });

    test('should add a node to the canvas', async ({ page }) => {
        // Click on a node type in the toolbar (e.g., Load Balancer)
        await page.click('button[title="Load Balancer"]');

        // Check if a node was added to the canvas
        const nodes = await page.locator('.group.cursor-grab').count();
        expect(nodes).toBeGreaterThan(0);
    });

    test('should open and close the challenge panel', async ({ page }) => {
        // Click on the Challenges button in the header
        await page.click('button:has-text("Challenges")');

        // Check if the Challenge Panel is visible
        await expect(page.locator('h2:has-text("Challenges")')).toBeVisible();

        // Select a challenge
        await page.click('h3:has-text("Global URL Shortener")');
        await expect(page.locator('h3:has-text("Global URL Shortener")').first()).toBeVisible();

        // Close the panel
        await page.click('button:has-text("Challenges")');
        await expect(page.locator('h2:has-text("Challenges")')).not.toBeVisible();
    });

    test('should trigger architectural audit', async ({ page }) => {
        // Add a node so we can audit
        await page.click('button[title="Load Balancer"]');

        // Click on Audit button
        await page.click('#sd-header-audit');

        // Check for "Scanning" overlay
        await expect(page.locator('text=Deep Scanning Architecture')).toBeVisible();

        // Note: We don't wait for actual AI completion in E2E to avoid flakiness and cost, 
        // unless using a mock. Here we just test the trigger.
    });
});
