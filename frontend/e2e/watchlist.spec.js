import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';
const APP_BASE = 'http://localhost:5173';

// Retry a few times in case services are still warming up
test.setTimeout(120000);

test('watchlist flow (API auth + UI visibility)', async ({ page, request }) => {
  // Register a fresh user via backend API
  const email = `e2e${Date.now()}@example.com`;
  const reg = await request.post(`${API_BASE}/auth/register`, {
    data: { name: 'E2E Tester', email, password: 'Password123!' },
  });
  expect(reg.status()).toBe(201);

  const rawSetCookie = reg.headers()['set-cookie'];
  expect(rawSetCookie).toBeTruthy();
  const match = rawSetCookie.match(/jwt=([^;]+)/);
  expect(match).toBeTruthy();
  const token = match[1];

  // Create a watchlist via API using the same cookie
  const create = await request.post(`${API_BASE}/watchlists`, {
    data: { name: 'E2E List', symbols: ['AAPL', 'MSFT'] },
    headers: { cookie: `jwt=${token}` },
  });
  expect(create.status()).toBe(201);

  // Set cookie in the browser context so the SPA treats us as logged in
  await page.context().addCookies([{ name: 'jwt', value: token, domain: 'localhost', path: '/' }]);
  // Go to watchlists page and verify the created list appears
  page.on('console', (msg) => console.log('BROWSER LOG ›', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('BROWSER ERROR ›', err.message));
  page.on('requestfailed', (req) => console.log('BROWSER REQ FAILED ›', req.url(), req.failure()?.errorText || ''));
  // ensure we capture logs before navigation
  await page.goto(`${APP_BASE}/watchlists`, { waitUntil: 'networkidle' });
  // Verify browser can access backend profile endpoint (cookie should be sent with credentials)
  const profileStatus = await page.evaluate((url) =>
    fetch(url, { credentials: 'include' })
      .then((r) => r.status)
      .catch((e) => `ERROR:${e.message}`),
    'http://localhost:5000/api/auth/profile'
  );
  console.log('browser http://localhost:5000/api/auth/profile status ->', profileStatus);
  // Debug: dump top-level heading and body text to help diagnose missing UI
  const h1Text = await page.evaluate(() => document.querySelector('h1')?.innerText || null);
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
  console.log('page h1 ->', h1Text);
  console.log('page body (first 2000 chars) ->', bodyText);
  // Allow extra time for SPA hydration and API-backed profile fetch
  await expect(page.getByRole('heading', { name: 'Watchlists' })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('text=E2E List')).toBeVisible({ timeout: 10000 });

  // Clean up: delete the created watchlist via API
  const lists = await request.get(`${API_BASE}/watchlists`, { headers: { cookie: `jwt=${token}` } });
  const data = await lists.json();
  const created = data.data.find(w => w.name === 'E2E List');
  if (created) {
    const del = await request.delete(`${API_BASE}/watchlists/${created._id}`, { headers: { cookie: `jwt=${token}` } });
    expect([200, 204]).toContain(del.status());
  }
});
