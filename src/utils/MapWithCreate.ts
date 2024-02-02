/**
 * Map with getOrCreate() method that automatically creates item
 * if it does not exist.
 */
export class MapWithCreate<K, V> extends Map<K, V> {
  getOrCreate(key: K, fn: (key: K) => V) {
    let item = this.get(key);
    if (!item) {
      item = fn(key);
      this.set(key, item);
    }

    return item;
  }
}
