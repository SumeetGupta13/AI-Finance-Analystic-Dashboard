import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';
const APP_BASE = 'http://localhost:5173';

test.setTimeout(120000);

test('news sentiment flow (login + search results)', async ({ page, request }) => {
  const email = `e2e${Date.now()}@example.com`;
  const reg = await request.post(`${API_BASE}/auth/register`, {
    data: { name: 'E2E News User', email, password: 'Password123!' },
  });
  expect(reg.status()).toBe(201);

  const rawSetCookie = reg.headers()['set-cookie'];
  expect(rawSetCookie).toBeTruthy();
  const match = rawSetCookie.match(/jwt=([^;]+)/);
  expect(match).toBeTruthy();
  const token = match[1];

  await page.context().addCookies([{ name: 'jwt', value: token, domain: 'localhost', path: '/' }]);
  await page.goto(`${APP_BASE}/news-sentiment`, { waitUntil: 'networkidle' });

  await expect(page.locator('text=News Sentiment').first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByPlaceholder('Search symbol, e.g. AAPL')).toBeVisible({ timeout: 10000 });

  await page.fill('input[placeholder="Search symbol, e.g. AAPL"]', 'AAPL');
  await page.click('button:has-text("Search")');

  await expect(page.locator('text=AAPL').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Sentiment Meter')).toBeVisible({ timeout: 10000 });

  const profileStatus = await page.evaluate((url) =>
    fetch(url, { credentials: 'include' })
      .then((r) => r.status)
      .catch((e) => `ERROR:${e.message}`),
    'http://localhost:5000/api/auth/profile'
  );
  console.log('browser http://localhost:5000/api/auth/profile status ->', profileStatus);
});
