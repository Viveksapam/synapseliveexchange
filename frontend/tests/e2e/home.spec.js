import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('/');
  
  // Wait for the app to load
  await expect(page).toHaveTitle(/Synapse/i);
  
  // Verify that the core components are rendered
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#projects')).toBeVisible();
  
  // Check that the navbar is present
  await expect(page.locator('nav')).toBeVisible();
});
