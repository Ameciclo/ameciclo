export async function fetchContagemData(lat: number, lon: number) {
  const url = `https://cyclist-counts.atlas.ameciclo.org/v1/locations`;
  
  try {
    console.log('🚀 Carregando contagem de:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
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
    return null; // Return null instead of throwing to prevent timeout
  }
}