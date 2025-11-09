import { SERVERS } from '~/servers';

export async function fetchExecucaoCicloviaria() {
  const url = 'http://192.168.10.114:3020/v1/ways/all-ways?precision=4&simplify=0.0001&city=2611606&minimal=true&only_all=true';
  
  try {
    console.log('🚀 Carregando de:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('📊 Status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Dados recebidos:');
    console.log('- Tipo:', data?.type);
    console.log('- Features:', data?.features?.length);
    console.log('- Primeira feature:', data?.features?.[0]);
    console.log('- Estrutura completa:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}