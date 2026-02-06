
import { test, expect } from '@playwright/test';

test('Home page debug', async ({ page }) => {
  try {
    await page.goto('/');
    const title = await page.title();
    console.log('DEBUG: Title is', title);
    
    // Check if we hit an error page
    const body = await page.textContent('body');
    if (body?.includes('Application error')) {
        console.log('DEBUG: App Error Detected');
    }

    await expect(page).toHaveTitle(/Mockmate/i);
    
    // Check for Feature Cards
    await expect(page.getByText('AI Quiz Generator')).toBeVisible();
    await expect(page.getByText('Mock Interviews')).toBeVisible();
  } catch (e) {
      console.error('Test Failed:', e);
      throw e;
  }
});
