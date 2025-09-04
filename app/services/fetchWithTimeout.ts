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
  onApiDown?: () => void
): Promise<any> {
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
      console.warn(`Erro na requisição para ${url}: ${response.status}`);
      onApiDown?.();
      return fallbackData;
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn(`Timeout na requisição para ${url} após ${timeout}ms`);
    } else {
      console.warn(`Falha ao acessar ${url}:`, error.message || error);
    }
    
    onApiDown?.();
    // Sempre retorna fallbackData, nunca lança exceção
    return fallbackData;
  }
}