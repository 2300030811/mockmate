import { test, expect } from '@playwright/test';

test('Home page debug', async ({ page }) => {
  await page.goto('/');

  // Check if we hit an error page
  const body = await page.textContent('body');
  if (body?.includes('Application error')) {
    console.log('DEBUG: App Error Detected');
  }

  await expect(page).toHaveTitle(/Mockmate/i);

  // Check for Feature Cards using accessible semantic selectors
  await expect(
    page.getByRole('link', { name: /quiz/i })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Mock Interviews', exact: true })
  ).toBeVisible();
});
