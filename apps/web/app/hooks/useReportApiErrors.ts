import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useApiStatus } from "~/contexts/ApiStatusContext";

type ApiErrorReport = {
  apiDown?: boolean;
  apiErrors?: Array<{ url: string; error: string }>;
};

/**
 * Reports per-page API errors returned by a loader into the global
 * ApiStatusContext. Replaces a ~10-line useEffect that every data route
 * used to copy-paste.
 *
 * Re-runs when apiDown or apiErrors change, so revalidated loaders also
 * update the status bar (the old pattern had an empty dep array and
 * missed revalidations).
 *
 *     const { data } = useSuspenseQuery(routeQueryOptions());
 *     useReportApiErrors(data);
 */
export function useReportApiErrors(data: ApiErrorReport | undefined) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setApiDown, addApiError } = useApiStatus();

  const apiDown = data?.apiDown ?? false;
  const apiErrors = data?.apiErrors;

  useEffect(() => {
    if (apiDown) setApiDown(true);
    if (apiErrors && apiErrors.length > 0) {
      for (const err of apiErrors) {
        addApiError(err.url, err.error, pathname);
      }
    }
  }, [apiDown, apiErrors, pathname, setApiDown, addApiError]);
}
