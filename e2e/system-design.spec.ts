import { test, expect } from '@playwright/test';

test.describe('System Design Canvas', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('mockmate_cookie_consent', 'accepted');
            window.localStorage.setItem('mockmate-sd-onboarded', 'true');
        });
        // Navigate to the system design page
        await page.goto('/system-design');
        // Wait for canvas and toolbar button readiness
        await expect(page.locator('#sd-canvas')).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Load Balancer' })
        ).toBeVisible({ timeout: 10_000 });
    });

    test('should add a node to the canvas', async ({ page }) => {
        // Click on a node type in the toolbar using role-based selector
        const loadBalancer = page.getByRole('button', { name: 'Load Balancer' });
        await loadBalancer.click();

        // Check if a node was added to the canvas
        await expect(page.locator('.group.cursor-grab')).toHaveCount(1);
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
        const loadBalancer = page.getByRole('button', { name: 'Load Balancer' });
        await loadBalancer.click();

        // Click on Audit button
        await page.click('#sd-header-audit');

        // Check for "Scanning" overlay
        await expect(page.locator('text=Deep Scanning Architecture')).toBeVisible();

        // Note: We don't wait for actual AI completion in E2E to avoid flakiness and cost, 
        // unless using a mock. Here we just test the trigger.
    });
});
