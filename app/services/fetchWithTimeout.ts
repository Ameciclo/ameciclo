/**
 * Função para realizar fetch com timeout e fallback
 * @param url URL para fazer a requisição
 * @param options Opções do fetch
 * @param timeout Tempo limite em ms (padrão: 5000ms)
 * @param fallbackData Dados de fallback caso a requisição falhe
 * @param onApiDown Callback para notificar quando a API estiver indisponível
 * @returns Resultado da requisição ou dados de fallback
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 15000,
  fallbackData: any = null,
  onApiDown?: () => void,
  retries: number = 2
): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validação básica
      if (data === null || data === undefined) {
        throw new Error('Invalid data received');
      }
      
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (attempt === retries) {
        console.warn(`Falha final para ${url} após ${retries + 1} tentativas:`, error.message || error);
        onApiDown?.();
        return fallbackData;
      }
      
      // Backoff exponencial: 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return fallbackData;
}