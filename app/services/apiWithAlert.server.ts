import { fetchWithTimeout } from './fetchWithTimeout';

// Função para ser usada nos loaders do servidor
export async function fetchWithServerAlert(
  url: string,
  options?: RequestInit,
  timeout?: number,
  fallbackData?: any
) {
  let apiDown = false;
  
  const result = await fetchWithTimeout(
    url,
    options,
    timeout,
    fallbackData,
    () => { apiDown = true; }
  );
  
  return { data: result, apiDown };
}