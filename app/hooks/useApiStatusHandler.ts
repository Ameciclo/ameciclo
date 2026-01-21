import { useEffect } from "react";
import { useApiStatus } from "~/contexts/ApiStatusContext";

interface ApiError {
  url: string;
  error: string;
}

export function useApiStatusHandler(
  apiDown: boolean,
  apiErrors: ApiError[] | undefined,
  routePath: string
) {
  const { setApiDown, addApiError } = useApiStatus();

  useEffect(() => {
    if (apiDown) {
      setApiDown(true);
    }

    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error) => {
        addApiError(error.url, error.error, routePath);
      });
    }
  }, [apiDown, apiErrors, routePath, setApiDown, addApiError]);
}
