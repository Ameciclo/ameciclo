const BASE_URL = 'https://ciclodados.atlas.ameciclo.org';

const endpoints = [
  '/',
  '/v1',
  '/v1/',
  '/v1/cyclist-profile',
  '/v1/cyclist-profile/',
  '/v1/health',
  '/docs',
  '/swagger',
  '/api',
  '/api/v1',
  '/openapi.json',
  '/redoc'
];

async function testEndpoint(endpoint) {
  const url = BASE_URL + endpoint;
  try {
    const response = await fetch(url);
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`  Data:`, JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log(`  Content (first 200 chars):`, text.substring(0, 200));
      }
    }
  } catch (error) {
    console.log(`${endpoint}: ERROR - ${error.message}`);
  }
  console.log('---');
}

async function exploreAPI() {
  console.log('Explorando endpoints da API ciclodados.atlas.ameciclo.org\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

exploreAPI();