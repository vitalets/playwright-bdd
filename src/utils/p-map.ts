/**
 * Runs fn for each item with at most `concurrency` items in-flight at a time.
 * Simple alternative to the p-map package.
 */
export async function pMap<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    let item: T | undefined;
    while ((item = queue.shift()) !== undefined) {
      await fn(item);
    }
  });
  await Promise.all(workers);
}
