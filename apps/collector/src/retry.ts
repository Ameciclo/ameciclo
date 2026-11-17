/** Calls fn until it works, waiting longer after each failure; throws the last error. */
export async function withRetries<T>(
  fn: (attempt: number) => Promise<T>,
  options: { attempts: number; baseMs: number; maxMs?: number; sleep?: (ms: number) => Promise<void>; onError?: (error: unknown, attempt: number) => void },
): Promise<T> {
  const { attempts, baseMs, maxMs = 10 * 60_000, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), onError } = options;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      onError?.(error, attempt);
      if (attempt < attempts) await sleep(Math.min(baseMs * 2 ** (attempt - 1), maxMs));
    }
  }
  throw lastError;
}
