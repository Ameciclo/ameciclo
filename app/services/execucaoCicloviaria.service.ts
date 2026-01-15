import { EXECUCAO_CICLOVIARIA_DATA } from '~/servers';

export async function fetchExecucaoCicloviaria() {
  const url = EXECUCAO_CICLOVIARIA_DATA;
  
  try {
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}