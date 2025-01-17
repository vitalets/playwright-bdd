import fs from 'node:fs';
import path from 'node:path';
import timers from 'node:timers/promises';
import crypto from 'crypto';

/**
 * Returns Symbol by name.
 * See: https://stackoverflow.com/questions/50453640/how-can-i-get-the-value-of-a-symbol-property
 */
export function getSymbolByName<T extends object>(target: T, name?: string) {
  const ownKeys = Reflect.ownKeys(target);
  const symbol = ownKeys.find((key) => key.toString() === `Symbol(${name})`);
  if (!symbol) {
    throw new Error(`Symbol "${name}" not found in target. ownKeys: ${ownKeys}`);
  }
  return symbol as keyof T;
}

export function removeDuplicates<T>(arr: T[]) {
  return [...new Set(arr)];
}

export function resolvePackageRoot(packageName: string) {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    return path.dirname(packageJsonPath);
  } catch {
    throw new Error(`Package "${packageName}" is not installed.`);
  }
}

export function getPackageVersion(packageName: string) {
  try {
    const packageRoot = resolvePackageRoot(packageName);
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return (packageJson.version || '') as string;
  } catch {
    return '';
  }
}

export async function callWithTimeout<T>(fn: () => T, timeout?: number, timeoutMsg?: string) {
  if (!timeout) return fn();

  const ac = new AbortController();
  return Promise.race([
    fn(),
    timers.setTimeout(timeout, null, { ref: false, signal: ac.signal }).then(() => {
      throw new Error(timeoutMsg || `Function timeout (${timeout} ms)`);
    }),
  ]).finally(() => ac.abort());
}

export function stringifyLocation({ line, column }: { line: number; column?: number }) {
  return `${line}:${column || 0}`;
}

export function omit<T extends object, K extends keyof T>(obj: T, key: K) {
  const res = { ...obj };
  delete res[key];
  return res as Omit<T, K>;
}

export function removeUndefined<T extends object>(obj: T) {
  if (!obj) return obj;
  const res = {} as T;
  const keys = Object.keys(obj) as (keyof T)[];
  keys.forEach((key) => {
    if (obj[key] !== undefined) res[key] = obj[key];
  });
  return res;
}

export function toArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

export function trimTrailingSlash(s: string) {
  return s.replace(/[/\\]+$/, '');
}

export function booleanDefault(value: unknown, defaultValue: boolean) {
  return typeof value === 'boolean' ? value : defaultValue;
}

// See: https://github.com/microsoft/playwright/blob/6f16b6cc08f7d59a079d9afa67afacc321a37675/packages/playwright-core/src/utils/crypto.ts#L24
export function calculateSha1(buffer: Buffer | string): string {
  const hash = crypto.createHash('sha1');
  const data = typeof buffer === 'string' ? buffer : new Uint8Array(buffer);
  hash.update(data);
  return hash.digest('hex');
}

export function throwIf(condition: unknown, message: string) {
  if (condition) throw new Error(message);
}

/**
 * Save file synchronously, create directory if needed.
 */
export function saveFileSync(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

export function toBoolean<T>(value: T): value is NonNullable<T> {
  return Boolean(value);
}

export function areSetsEqual<T>(set1: Set<T>, set2: Set<T>) {
  return set1.size === set2.size && [...set1].every((val) => set2.has(val));
}

export function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Replace placeholders in a template string.
 * Example:
 * 'Hello, {name}' + {name: 'John' } -> 'Hello, John'
 */
export function substitute(template: string, params: Record<string, string>) {
  return template.replace(/{(\w+)}/g, (_, key) => params[key] ?? `{${key}}`);
}
