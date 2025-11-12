const BASE_URL = 'https://ciclodados.atlas.ameciclo.org';

async function testWithOptions(endpoint) {
  const url = BASE_URL + endpoint;
  
  try {
    // Teste com OPTIONS para ver métodos permitidos
    const optionsResponse = await fetch(url, { method: 'OPTIONS' });
    console.log(`OPTIONS ${endpoint}: ${optionsResponse.status}`);
    
    const allowHeader = optionsResponse.headers.get('Allow');
    if (allowHeader) {
      console.log(`  Allow: ${allowHeader}`);
    }
    
    const corsHeaders = {
      'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin')
    };
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) console.log(`  ${key}: ${value}`);
    });
    
  } catch (error) {
    console.log(`OPTIONS ${endpoint}: ERROR - ${error.message}`);
  }
  
  console.log('---');
}

async function checkDNS() {
  console.log('Verificando se o domínio resolve...\n');
  
  try {
    const response = await fetch(BASE_URL, { 
      method: 'HEAD',
      timeout: 5000 
    });
    console.log(`HEAD /: ${response.status} ${response.statusText}`);
    
    // Mostrar headers de resposta
    console.log('Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (error) {
    console.log(`HEAD /: ERROR - ${error.message}`);
  }
  
  console.log('\n=== Testando métodos OPTIONS ===\n');
  
  const endpoints = ['/', '/v1', '/v1/cyclist-profile'];
  for (const endpoint of endpoints) {
    await testWithOptions(endpoint);
  }
}

checkDNS();