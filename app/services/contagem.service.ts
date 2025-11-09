export async function fetchContagemData(lat: number, lon: number) {
  const url = `http://192.168.10.114:3002/v1/locations/nearby?lat=${lat}&lon=${lon}`;
  
  try {
    console.log('🚀 Carregando contagem de:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('📊 Status contagem:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Dados de contagem recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erro contagem:', error);
    throw error;
  }
}