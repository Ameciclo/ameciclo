/**
 * Função utilitária para fazer fetch para o CMS com headers corretos
 */
export async function fetchFromCMS(url: string, options?: RequestInit): Promise<Response> {
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers
    }
  });
}

/**
 * Função para fazer fetch e retornar JSON decodificado
 */
export async function fetchJsonFromCMS<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetchFromCMS(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}