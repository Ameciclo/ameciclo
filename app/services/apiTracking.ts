/**
 * Tiny aggregator for per-request API error tracking inside a loader.
 *
 * Every loader used to reinvent this:
 *     const errors = [];
 *     const onError = (url) => (err) => errors.push({ url, error: err });
 *     const data = await fetchWithTimeout(URL, {}, 5000, null, onError(URL));
 *     return { apiDown: errors.length > 0, apiErrors: errors, ... };
 *
 * Now:
 *     const tracker = makeApiErrorTracker();
 *     const data = await cmsFetch(URL, { onError: tracker.at(URL) });
 *     return { ...tracker.summary(), ... };
 */

export type ApiError = { url: string; error: string };

export type ApiErrorTracker = {
  /** Returns an onError callback bound to `url`. */
  at: (url: string) => (error: string) => void;
  /** Returns `{ apiDown, apiErrors }` for the loader response. */
  summary: () => { apiDown: boolean; apiErrors: ApiError[] };
};

export function makeApiErrorTracker(): ApiErrorTracker {
  const errors: ApiError[] = [];
  return {
    at: (url) => (error) => {
      errors.push({ url, error });
    },
    summary: () => ({ apiDown: errors.length > 0, apiErrors: errors }),
  };
}
