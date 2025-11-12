const BASE_URL = 'https://ciclodados.atlas.ameciclo.org';

async function testNearbyEndpoint() {
  // Coordenadas de teste (Recife)
  const lat = -8.056304656051244;
  const lng = -34.8980945645253;
  const radius = 200;
  
  const url = `${BASE_URL}/v1/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
  console.log('Testing URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response Data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error Response:', await response.text());
    }
  } catch (error) {
    console.error('Fetch Error:', error.message);
  }
}

// Testar também outros parâmetros
async function testDifferentParams() {
  console.log('\n=== Testando diferentes parâmetros ===\n');
  
  const tests = [
    { lat: -8.056304656051244, lng: -34.8980945645253, radius: 100 },
    { lat: -8.056304656051244, lng: -34.8980945645253, radius: 500 },
    { lat: -8.0476, lng: -34.8770, radius: 200 }, // Centro do Recife
  ];
  
  for (const params of tests) {
    const url = `${BASE_URL}/v1/nearby?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`;
    console.log(`\nTesting: radius=${params.radius}, lat=${params.lat}, lng=${params.lng}`);
    
    try {
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Results count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log('First result:', JSON.stringify(data[0], null, 2));
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

async function runTests() {
  await testNearbyEndpoint();
  await testDifferentParams();
}

runTests();