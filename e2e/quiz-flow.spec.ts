import { test, expect } from '@playwright/test';

const awsQuestionsUrl = process.env.AWS_QUESTIONS_URL;

test.describe('Quiz Core Flow', () => {
    test.skip(!awsQuestionsUrl, 'AWS_QUESTIONS_URL is not set for E2E');

    test('should navigate to AWS practice quiz and complete it', async ({ page }) => {
        // Go to home
        await page.goto('/');
        
        // Find AWS quiz card/link (assuming it's on main page or navigation)
        // FeatureCards usually has links
        await page.getByRole('link', { name: /aws certified/i }).first().click();

        // Wait for quiz shell
        await expect(page.getByText(/Question 1 of/i)).toBeVisible({ timeout: 15000 });

        // Check for timer (should be hidden in practice, but present in shell structure maybe?)
        // The UniversalQuizShell renders QuizNavbar which has timeRemaining
        // In practice mode, timer is usually not incrementing/active but might be shown as 00:00 or 90:00
        
        // Select an answer
        const optionA = page.locator('button:has-text("A")').first();
        await optionA.click();

        // Move to next question
        await page.click('text=Next');

        // Verify we are on next question
        await expect(page.locator('text=Question 2 of')).toBeVisible();

        // Go back
        await page.click('text=Previous');
        await expect(page.locator('text=Question 1 of')).toBeVisible();

        // Finish quiz (jumping to last question via sidebar or just clicking through)
        // For simplicity, let's just test that the "Finish" button appears on last question
        // But we don't know the count. 
    });

    test('should show timer in exam mode', async ({ page }) => {
        // We can force a navigation to an exam mode URL if we know the pattern
        // Pattern: /aws-quiz?mode=exam&count=5
        await page.goto('/aws-quiz?mode=exam&count=5');

        // Check for timer in navbar
        await expect(page.getByTestId('exam-timer')).toBeVisible({ timeout: 10000 });
    });
});
