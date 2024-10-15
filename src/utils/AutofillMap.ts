/**
 * Extended Map that automatically creates item if it does not exist.
 * Usage:
 * const map = new AutofillMap<string, number[]>();
 * map.getOrCreate('key', () => []);
 */

export class AutofillMap<K, V> extends Map<K, V> {
  getOrCreate(key: K, createFn: (key: K) => V) {
    let item = this.get(key);
    if (!item) {
      item = createFn(key);
      this.set(key, item);
    }

    return item;
  }
}
