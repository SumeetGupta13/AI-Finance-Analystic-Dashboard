require('dotenv').config({ path: '../.env' });

const API_BASE_URL = 'http://localhost:4000/api';

const endpoints = [
  { name: 'Health API', url: '/health' },
  { name: 'Auth profile (Expected 401 without token)', url: '/auth/profile' },
  { name: 'Market stocks', url: '/market/stocks' },
  { name: 'Market trends', url: '/market/trends' },
  { name: 'Crypto data', url: '/market/crypto' },
  { name: 'News data', url: '/market/news' },
  { name: 'AI insights', url: '/market/ai-insights' },
  { name: 'News sentiment', url: '/market/sentiment' },
];

async function checkFeatureApis() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('      StockIQ API Feature Check       ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Checking against ${API_BASE_URL}...\n`);

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${endpoint.name} working (${response.status})`);
      } else if (response.status === 401 || response.status === 403) {
        console.log(`✅ ${endpoint.name} correctly secured (${response.status})`);
      } else if (response.status === 429) {
        console.log(`⚠️ ${endpoint.name} failed: 429 rate limit, fallback should have been used.`);
      } else {
        console.log(`❌ ${endpoint.name} failed: Status ${response.status}`);
      }
    } catch (error) {
      if (error.cause && error.cause.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.name} failed: Backend server is not running on port 4000`);
      } else {
        console.log(`❌ ${endpoint.name} failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('              Check Complete              ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkFeatureApis();
