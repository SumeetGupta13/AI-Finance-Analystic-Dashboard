import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';
const APP_BASE = 'http://localhost:5173';

test.setTimeout(120000);

test('news flow (login + sentiment badges)', async ({ page, request }) => {
  const email = `e2e${Date.now()}@example.com`;
  const reg = await request.post(`${API_BASE}/auth/register`, {
    data: { name: 'E2E News User', email, password: 'Password123!' },
  });
  expect(reg.status()).toBe(201);

  const regBody = await reg.json();
  const token = regBody.data.token;
  expect(token).toBeTruthy();

  await page.addInitScript((authToken) => {
    window.localStorage.setItem('stockiq_token', authToken);
  }, token);
  await page.context().addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }]);

  await page.goto(`${APP_BASE}/news`, { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'Market intelligence' })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('text=positive').first()).toBeVisible({ timeout: 10000 });

  const profileStatus = await page.evaluate((url) =>
    fetch(url, { credentials: 'include' })
      .then((response) => response.status)
      .catch((error) => `ERROR:${error.message}`),
    `${API_BASE}/auth/profile`
  );
  expect(profileStatus).toBe(200);
});
