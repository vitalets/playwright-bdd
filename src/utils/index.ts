import fs from 'node:fs';
import path from 'node:path';
import timers from 'node:timers/promises';

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

/**
 * Inserts params into template.
 * Params defined as <param>.
 */
export function template(t: string, params: Record<string, unknown> = {}) {
  return t.replace(/<(.+?)>/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Extracts all template params from string.
 * Params defined as <param>.
 */
export function extractTemplateParams(t: string) {
  return [...t.matchAll(/<(.+?)>/g)].map((m) => m[1]);
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
  return `${line}:${column}`;
}

export function omit<T extends object, K extends keyof T>(obj: T, key: K) {
  const res = { ...obj };
  delete res[key];
  return res as Omit<T, K>;
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
