import { test, expect } from '@playwright/test';

test('SaaS Owner Onboarding Flow', async ({ page }) => {
  // 1. Log in as owner (using Super Admin credentials)
  await page.goto('/en/login');
  await page.getByText('Super Admin').click();
  await page.getByRole('button', { name: 'Login' }).click();

  // 2. Verify Command Center
  await expect(page.getByText('Command Center')).toBeVisible();

  // 3. Create a new "Test School"
  await page.goto('/en/super/schools');
  await page.getByPlaceholder('e.g. Skyline Driving Academy').fill('Test Verification School');
  await page.getByPlaceholder('admin@school.com').fill('test-admin@verification.com');
  await page.getByRole('button', { name: 'Authorize & Create' }).click();

  // 4. Verify school created in table
  await expect(page.getByText('Test Verification School')).toBeVisible();

  // 5. Impersonate that school's admin
  await page.getByRole('button', { name: 'Impersonate' }).first().click();

  // 6. Verify we are on the School Dashboard
  await expect(page.getByText('Observatory')).toBeVisible();
  await expect(page.getByText('Impersonating')).toBeVisible();

  // 7. Log out
  await page.getByRole('button', { name: 'admin@drivepro.io' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();

  // 8. Verify back at login
  await expect(page.getByText('Admin Portal')).toBeVisible();
});
