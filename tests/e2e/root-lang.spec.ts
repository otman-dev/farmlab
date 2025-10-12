import { test, expect } from '@playwright/test';

test.describe('Root page language variants', () => {
  test('English default', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.locator('text=Smart Farming')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', /en|en-US/i);
  });

  test('French via query param', async ({ page }) => {
    await page.goto('http://localhost:3000/?lang=fr');
    await expect(page.locator('text=Résultats réels')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('html')).toHaveAttribute('lang', /fr/i);
  });

  test('Arabic via query param (RTL check)', async ({ page }) => {
    await page.goto('http://localhost:3000/?lang=ar');
    await expect(page.locator('text=نتائج حقيقية')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', /ar/i);
  });
});
