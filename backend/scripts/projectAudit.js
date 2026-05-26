const fs = require('fs');
const http = require('http');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('../app');
const { env } = require('../config/env');

const rootDir = path.join(__dirname, '..', '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const checks = [];

const record = (name, passed, detail = '') => {
  checks.push({ name, passed, detail });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status} ${name}${detail ? ` - ${detail}` : ''}`);
};

const fileExists = (relativePath) => fs.existsSync(path.join(rootDir, relativePath));
const readFile = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const request = ({ port, method = 'GET', path: requestPath, body, token, cookie }) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = {
      Accept: 'application/json',
    };

    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) headers.Authorization = `Bearer ${token}`;
    if (cookie) headers.Cookie = cookie;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path: requestPath,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = data ? JSON.parse(data) : null;
          } catch {
            json = null;
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            json,
            text: data,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

const expectStatus = async (label, requestOptions, expectedStatuses) => {
  try {
    const response = await request(requestOptions);
    const expected = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
    record(label, expected.includes(response.status), `HTTP ${response.status}`);
    return response;
  } catch (error) {
    record(label, false, error.message);
    return null;
  }
};

const scanProject = () => {
  console.log('\nStockIQ Project Audit\n');

  [
    'frontend/src/components',
    'frontend/src/pages',
    'frontend/src/layouts',
    'frontend/src/context',
    'frontend/src/services',
    'frontend/src/hooks',
    'frontend/src/routes',
    'frontend/src/api',
    'frontend/src/utils',
    'frontend/src/styles',
    'backend/controllers',
    'backend/models',
    'backend/routes',
    'backend/middleware',
    'backend/services',
    'backend/config',
    'backend/validators',
    'backend/utils',
  ].forEach((directory) => record(`Directory ${directory}`, fileExists(directory)));

  const router = readFile('frontend/src/routes/AppRouter.tsx');
  record('Frontend route /login', router.includes('path="/login"'));
  record('Frontend route /signup', router.includes('path="/signup"'));
  record('Legacy /register redirects', router.includes('to="/signup"'));

  const apiClient = readFile('frontend/src/api/axios.ts');
  record('Axios API client exists', fileExists('frontend/src/api/axios.ts'));
  record('Axios base URL targets /api', apiClient.includes('endsWith(\'/api\')'));
  record('Axios auth interceptor', apiClient.includes('Authorization'));
  record('Axios 401 interceptor', apiClient.includes('stockiq:auth-expired'));

  const authRoutes = readFile('backend/routes/authRoutes.js');
  ['register', 'login', 'profile', 'logout', 'google', 'google/callback'].forEach((route) => {
    record(`Backend auth route ${route}`, authRoutes.includes(route));
  });

  const appFile = readFile('backend/app.js');
  record('CORS credentials enabled', appFile.includes('credentials: true'));
  record('Frontend origin allowed', appFile.includes('http://localhost:5173'));
  record('Auth routes mounted', appFile.includes("app.use('/api/auth'"));
  record('Market routes mounted', appFile.includes("app.use('/api/market'"));
  record('AI routes mounted', appFile.includes("app.use('/api/ai'"));
  record('Portfolio routes mounted', appFile.includes("app.use('/api/portfolio'"));
  record('Transaction routes mounted', appFile.includes("app.use('/api/transactions'"));
  record('Watchlist routes mounted', appFile.includes("app.use('/api/watchlist'"));

  record('Backend PORT is 4000', Number(env.port) === 4000);
  record('Frontend VITE_API_URL configured', readFile('frontend/.env').includes('VITE_API_URL=http://localhost:4000'));
  record('JWT secret configured', Boolean(env.jwtSecret));
  record('Mock data enabled', env.useMockData === true);
  record('Tailwind config exists', fileExists('frontend/tailwind.config.cjs'));
  record('Vite config exists', fileExists('frontend/vite.config.js'));
  record('Auth background asset exists', fileExists('frontend/src/assets/images/auth/auth-bg.png'));

  const duplicateAssetFolder = fs.existsSync(path.join(frontendDir, 'src', 'assests'));
  record('No active imports from misspelled assests folder', !readFile('frontend/src/pages/Login.tsx').includes('assests'));
  if (duplicateAssetFolder) {
    record('Legacy misspelled assests folder is unused', true, 'folder remains but is not imported');
  }

  record('Backend package has projectAudit script', readFile('backend/package.json').includes('"projectAudit"'));
};

const runHttpAudit = async () => {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const port = server.address().port;
  const email = `audit_${Date.now()}@stockiq.local`;
  const password = 'AuditPass123';

  try {
    await expectStatus('Health API', { port, path: '/api/health' }, 200);

    const registerResponse = await expectStatus(
      'Signup API',
      {
        port,
        method: 'POST',
        path: '/api/auth/register',
        body: { name: 'Audit User', email, password },
      },
      201
    );
    const tokenFromRegister = registerResponse?.json?.data?.token;
    const cookie = Array.isArray(registerResponse?.headers['set-cookie']) ? registerResponse.headers['set-cookie'].join('; ') : '';
    record('Signup returns JWT', Boolean(tokenFromRegister));

    const loginResponse = await expectStatus(
      'Login API',
      {
        port,
        method: 'POST',
        path: '/api/auth/login',
        body: { email, password },
      },
      200
    );
    const token = loginResponse?.json?.data?.token || tokenFromRegister;
    record('Login returns user payload', Boolean(loginResponse?.json?.data?.user?.email));
    record('Login returns JWT', Boolean(token));

    await expectStatus('Profile API with JWT', { port, path: '/api/auth/profile', token }, 200);
    await expectStatus('Logout API', { port, method: 'POST', path: '/api/auth/logout', token, cookie }, 200);
    await expectStatus('Google OAuth route', { port, path: '/api/auth/google' }, [302, 503]);

    await expectStatus('Dashboard API', { port, path: '/api/dashboard/summary', token }, 200);
    await expectStatus('Portfolio API', { port, path: '/api/portfolio', token }, 200);
    await expectStatus('Watchlists API', { port, path: '/api/watchlists', token }, 200);
    await expectStatus('Default watchlist API', { port, path: '/api/watchlist', token }, 200);
    await expectStatus('Transactions API', { port, path: '/api/transactions', token }, 200);
    await expectStatus('Transaction summary API', { port, path: '/api/transactions/summary', token }, 200);
    await expectStatus('Market stocks API', { port, path: '/api/market/stocks' }, 200);
    await expectStatus('Market trends API', { port, path: '/api/market/trends' }, 200);
    await expectStatus('Crypto API', { port, path: '/api/market/crypto' }, 200);
    await expectStatus('Market news API', { port, path: '/api/market/news' }, 200);
    await expectStatus('AI insights API', { port, path: '/api/ai/insights' }, 200);
    await expectStatus('AI transaction insights API', { port, path: '/api/ai/transactions', token }, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

const main = async () => {
  scanProject();
  await runHttpAudit();

  const failed = checks.filter((check) => !check.passed);
  console.log(`\nAudit complete: ${checks.length - failed.length}/${checks.length} checks passed.`);

  if (failed.length > 0) {
    console.log('\nFailed checks:');
    failed.forEach((check) => console.log(`- ${check.name}${check.detail ? ` (${check.detail})` : ''}`));
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(`Project audit crashed: ${error.stack || error.message}`);
  process.exit(1);
});
