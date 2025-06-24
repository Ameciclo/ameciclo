import { useApiStatus } from '~/contexts/ApiStatusContext';
import { fetchWithTimeout } from '~/services/fetchWithTimeout';

export function useApiWithAlert() {
  const { setApiDown } = useApiStatus();

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
      () => setApiDown(true)
    );
  };

  return { fetchWithAlert };
}