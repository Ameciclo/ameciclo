import { useApiStatus } from '~/contexts/ApiStatusContext';
import { fetchWithTimeout } from '~/services/fetchWithTimeout';
import { useRouterState } from '@tanstack/react-router';

export function useApiWithAlert() {
  const { addApiError } = useApiStatus();
  const location = useRouterState({ select: (s) => s.location });

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