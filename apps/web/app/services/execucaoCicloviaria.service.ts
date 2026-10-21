import { EXECUCAO_CICLOVIARIA_DATA } from '~/servers';

export async function fetchExecucaoCicloviaria() {
  try {
    const response = await fetch(EXECUCAO_CICLOVIARIA_DATA, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao buscar dados de execução cicloviária:', error);
    throw error;
  }
}