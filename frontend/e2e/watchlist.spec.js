import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';
const APP_BASE = 'http://localhost:5173';

test.setTimeout(120000);

test('watchlist flow (API auth + UI visibility)', async ({ page, request }) => {
  const email = `e2e${Date.now()}@example.com`;
  const reg = await request.post(`${API_BASE}/auth/register`, {
    data: { name: 'E2E Tester', email, password: 'Password123!' },
  });
  expect(reg.status()).toBe(201);

  const regBody = await reg.json();
  const token = regBody.data.token;
  expect(token).toBeTruthy();

  const create = await request.post(`${API_BASE}/watchlists`, {
    data: { name: 'E2E List' },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(create.status()).toBe(201);

  await page.addInitScript((authToken) => {
    window.localStorage.setItem('stockiq_token', authToken);
  }, token);
  await page.context().addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }]);

  await page.goto(`${APP_BASE}/watchlist`, { waitUntil: 'networkidle' });

  const profileStatus = await page.evaluate((url) =>
    fetch(url, { credentials: 'include' })
      .then((response) => response.status)
      .catch((error) => `ERROR:${error.message}`),
    `${API_BASE}/auth/profile`
  );
  expect(profileStatus).toBe(200);

  await expect(page.getByRole('heading', { name: 'Track conviction' })).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'E2E List' })).toBeVisible({ timeout: 10000 });

  const lists = await request.get(`${API_BASE}/watchlists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await lists.json();
  const created = data.data.find((watchlist) => watchlist.name === 'E2E List');

  if (created) {
    const del = await request.delete(`${API_BASE}/watchlists/${created._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 204]).toContain(del.status());
  }
});
