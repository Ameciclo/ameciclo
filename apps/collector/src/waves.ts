/** Runs fn over the items a few at a time, keeping the order of the results. */
export async function inWaves<T, R>(items: readonly T[], size: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let start = 0; start < items.length; start += size) {
    const wave = items.slice(start, start + size);
    results.push(...(await Promise.all(wave.map((item, offset) => fn(item, start + offset)))));
  }
  return results;
}
