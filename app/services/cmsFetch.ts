/**
 * CMS fetch with Cloudflare Cache API integration.
 *
 * Strapi/external API responses are cached at the edge (shared across all
 * visitors for the same Worker) via `caches.default`, which is much stronger
 * than relying on the Node-style `fetch(url, { cache: 'force-cache' })` option
 * (Workers doesn't honor it).
 *
 * Usage:
 *   const data = await cmsFetch(HOME_DATA, { ttl: 300 });
 *
 * If the cache API isn't available (e.g. Vite dev, Node runtime), falls back
 * to a direct fetch + timeout.
 */

import { fetchWithTimeout } from "./fetchWithTimeout";

type CmsFetchOptions = {
  /** Edge cache TTL in seconds. Defaults to 300 (5 min). Set to 0 to skip caching. */
  ttl?: number;
  /** Request timeout in ms. Defaults to 5000. */
  timeout?: number;
  /** Fallback value if the request fails. */
  fallback?: unknown;
  /** Optional error reporter (e.g. addApiError). */
  onError?: (err: string) => void;
  /** Retries on failure. Defaults to 1. */
  retries?: number;
  /** Extra fetch options. */
  init?: RequestInit;
};

declare const caches: { default: Cache } | undefined;

export async function cmsFetch<T = unknown>(
  url: string,
  opts: CmsFetchOptions = {}
): Promise<T> {
  const {
    ttl = 300,
    timeout = 5000,
    fallback = null,
    onError,
    retries = 1,
    init = {},
  } = opts;

  const edgeCache =
    typeof caches !== "undefined" && ttl > 0 ? caches.default : null;

  if (edgeCache) {
    const cacheKey = new Request(url, { method: "GET" });
    const hit = await edgeCache.match(cacheKey);
    if (hit) {
      try {
        return (await hit.json()) as T;
      } catch {
        // fall through to refetch on parse error
      }
    }
  }

  const data = (await fetchWithTimeout(
    url,
    init,
    timeout,
    fallback,
    onError,
    retries
  )) as T;

  if (edgeCache && data && data !== fallback) {
    const body = JSON.stringify(data);
    const res = new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 4}`,
      },
    });
    try {
      await edgeCache.put(new Request(url, { method: "GET" }), res);
    } catch {
      // Edge cache put is best-effort
    }
  }

  return data;
}
