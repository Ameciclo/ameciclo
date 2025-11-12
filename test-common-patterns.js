const BASE_URL = 'https://ciclodados.atlas.ameciclo.org';

// Padrões comuns de API
const commonPatterns = [
  // Documentação
  '/docs',
  '/documentation',
  '/api-docs',
  '/swagger-ui',
  '/swagger.json',
  '/openapi.json',
  
  // Health checks
  '/health',
  '/status',
  '/ping',
  '/version',
  
  // API versioning
  '/api',
  '/api/v1',
  '/v1',
  '/v2',
  
  // Cyclist profile variations
  '/cyclist-profile',
  '/cyclist_profile',
  '/profile',
  '/profiles',
  '/users',
  '/user',
  
  // Data endpoints
  '/data',
  '/dados',
  '/locations',
  '/points',
  '/nearby',
  
  // Common REST patterns
  '/cyclists',
  '/cyclist',
  '/analytics',
  '/statistics',
  '/summary'
];

async function testPattern(pattern) {
  const url = BASE_URL + pattern;
  try {
    const response = await fetch(url);
    if (response.status !== 404) {
      console.log(`✓ ${pattern}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            console.log(`  Data:`, JSON.stringify(data, null, 2).substring(0, 300));
          } catch (e) {
            console.log(`  JSON parse error: ${e.message}`);
          }
        }
      }
    } else {
      console.log(`✗ ${pattern}: 404`);
    }
  } catch (error) {
    console.log(`✗ ${pattern}: ERROR - ${error.message}`);
  }
}

async function testAllPatterns() {
  console.log('Testando padrões comuns de API...\n');
  
  for (const pattern of commonPatterns) {
    await testPattern(pattern);
  }
  
  console.log('\n=== Testando combinações v1 ===\n');
  
  const v1Patterns = [
    '/v1/cyclist-profile',
    '/v1/cyclist_profile', 
    '/v1/profile',
    '/v1/profiles',
    '/v1/data',
    '/v1/locations',
    '/v1/points',
    '/v1/nearby',
    '/v1/summary',
    '/v1/health'
  ];
  
  for (const pattern of v1Patterns) {
    await testPattern(pattern);
  }
}

testAllPatterns();