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
  timeout: number = 5000,
  fallbackData: any = null,
  onApiDown?: (error: string) => void,
  retries: number = 1
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
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
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
        let errorMessage = 'Erro desconhecido';
        
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage = JSON.stringify(error);
        }
        
        console.warn(`Falha final para ${url} após ${retries + 1} tentativas:`, errorMessage);
        onApiDown?.(errorMessage);
        return fallbackData;
      }
      
      // Backoff reduzido: 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return fallbackData;
}