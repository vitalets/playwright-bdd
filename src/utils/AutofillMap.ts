/**
 * Extended Map that automatically creates item if it does not exist.
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
