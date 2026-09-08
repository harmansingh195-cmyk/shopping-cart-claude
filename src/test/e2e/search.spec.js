// Playwright E2E spec — Product Search by Name
// Covers AC1–AC9 and NFR5 from requirements.md.
//
// Prerequisites:
//   - The Spring Boot application must be running on http://localhost:8080
//   - Run: mvn spring-boot:run   (in a separate terminal before invoking this spec)
//
// Invoke with:
//   npx playwright test src/test/e2e/search.spec.js
//   or via the package.json script: npm run test:e2e

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';
const TOTAL_PRODUCTS = 4;

// Helper: clear the search box and wait until all products are visible.
async function clearSearch(page) {
  const input = page.locator('#search-input');
  await input.fill('');
  // Wait until the grid contains at least TOTAL_PRODUCTS product cards.
  await expect(page.locator('.card')).toHaveCount(TOTAL_PRODUCTS, { timeout: 3000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  // Wait for at least one product card to confirm the API response has been rendered.
  await expect(page.locator('.card').first()).toBeVisible({ timeout: 5000 });
  // Reset search state so every test starts from a clean slate.
  await clearSearch(page);
});

// AC1 — Search input is present above the product grid and has an aria-label.
test('AC1: search input is visible with correct aria-label', async ({ page }) => {
  const input = page.locator('#search-input');
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('aria-label', 'Search products');
  // Verify the input appears before the product grid in the DOM.
  const inputBox = await input.boundingBox();
  const gridBox = await page.locator('#products').boundingBox();
  expect(inputBox.y).toBeLessThan(gridBox.y);
});

// AC2 — Typing "la" (lowercase) filters to Laptop only.
test('AC2: typing "la" shows only Laptop', async ({ page }) => {
  await page.locator('#search-input').fill('la');
  await expect(page.locator('.card')).toHaveCount(1, { timeout: 2000 });
  await expect(page.locator('.card h3')).toHaveText('Laptop');
});

// AC3 — Typing "LA" (uppercase) also filters to Laptop only (case-insensitive).
test('AC3: typing "LA" (uppercase) shows only Laptop', async ({ page }) => {
  await page.locator('#search-input').fill('LA');
  await expect(page.locator('.card')).toHaveCount(1, { timeout: 2000 });
  await expect(page.locator('.card h3')).toHaveText('Laptop');
});

// AC5 — Typing a single character "l" does not filter (threshold < 2 chars — shows all products).
test('AC5: single character "l" shows all products (threshold not met)', async ({ page }) => {
  await page.locator('#search-input').fill('l');
  // Debounce is 200 ms; allow a bit more.
  await page.waitForTimeout(400);
  await expect(page.locator('.card')).toHaveCount(TOTAL_PRODUCTS);
});

// AC6 — Typing "xyz" shows the "No products found" empty-state message.
test('AC6: "xyz" shows No products found message', async ({ page }) => {
  await page.locator('#search-input').fill('xyz');
  await expect(page.locator('.no-results')).toBeVisible({ timeout: 2000 });
  await expect(page.locator('.no-results')).toHaveText('No products found');
  // Confirm that no product cards are rendered.
  await expect(page.locator('.card')).toHaveCount(0);
});

// AC9 — Clearing the search input after "la" restores all products.
test('AC9: clearing search after "la" restores all products', async ({ page }) => {
  await page.locator('#search-input').fill('la');
  await expect(page.locator('.card')).toHaveCount(1, { timeout: 2000 });

  // Clear input — should restore full product list.
  await page.locator('#search-input').fill('');
  await expect(page.locator('.card')).toHaveCount(TOTAL_PRODUCTS, { timeout: 2000 });
});

// NFR5 — Add Laptop to cart while search is active ("la" filter), then checkout.
// Verifies that cart/checkout still works correctly when only a filtered subset is displayed.
test('NFR5: add Laptop to cart while filtered, checkout succeeds', async ({ page }) => {
  // Filter to Laptop only.
  await page.locator('#search-input').fill('la');
  await expect(page.locator('.card')).toHaveCount(1, { timeout: 2000 });

  // Capture the checkout alert.
  let alertMessage = '';
  page.once('dialog', async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  // Add Laptop to cart.
  await page.locator('.card button').click();
  // Click Checkout.
  await page.locator('button:has-text("Checkout")').click();

  // Wait briefly for the alert handler to fire.
  await page.waitForTimeout(300);

  expect(alertMessage).toContain('Order placed successfully');
});
