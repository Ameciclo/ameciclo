/**
 * Função para realizar fetch com timeout e fallback
 * @param url URL para fazer a requisição
 * @param options Opções do fetch
 * @param timeout Tempo limite em ms (padrão: 5000ms)
 * @param fallbackData Dados de fallback caso a requisição falhe
 * @returns Resultado da requisição ou dados de fallback
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 10000,
  fallbackData: any = null
): Promise<any> {
  // Cria um AbortController para cancelar a requisição se demorar muito
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Erro na requisição para ${url}: ${response.status}`);
      return fallbackData;
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Falha ao acessar ${url}:`, error);
    return fallbackData;
  }
}