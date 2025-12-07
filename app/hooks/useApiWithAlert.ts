import { useApiStatus } from '~/contexts/ApiStatusContext';
import { fetchWithTimeout } from '~/services/fetchWithTimeout';
import { useLocation } from '@remix-run/react';

export function useApiWithAlert() {
  const { addApiError } = useApiStatus();
  const location = useLocation();

  const fetchWithAlert = async (
    url: string,
    options?: RequestInit,
    timeout?: number,
    fallbackData?: any
  ) => {
    return fetchWithTimeout(
      url,
      options,
      timeout,
      fallbackData,
      (error: string) => addApiError(url, error, location.pathname)
    );
  };

  return { fetchWithAlert };
}