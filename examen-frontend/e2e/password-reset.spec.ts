import { expect, test } from '@playwright/test';
import { apiPath, fulfillJson } from './support';

test('user can request and confirm password reset', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const method = route.request().method();
    const path = apiPath(route);

    if (method === 'POST' && path === '/api/auth/reset/request') {
      return fulfillJson(route, {}, 202);
    }

    if (method === 'POST' && path === '/api/auth/reset/confirm') {
      return fulfillJson(route, {}, 204);
    }

    return fulfillJson(route, {});
  });

  await page.goto('/auth/reset');

  await page.locator('#email').fill('reset@example.com');
  await page.getByRole('button', { name: 'Request reset' }).click();
  await expect(page.getByText('Check your email for a reset link or code. Enter it below to continue.')).toBeVisible();

  await page.locator('#token').fill('sample-reset-token');
  await page.locator('#newPassword').fill('NewStrongPass1!');
  await page.getByRole('button', { name: 'Reset password' }).click();

  await expect(page.getByText('Password reset successful. You can log in now.')).toBeVisible();
});
