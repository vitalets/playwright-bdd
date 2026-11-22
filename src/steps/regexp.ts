import type { PlaywrightLocation } from '../playwright/types';
import { relativeToCwd } from '../utils/paths';

/**
 * With RegExp `g` (gloabl) or `y` (sticky), the same step text can match once and fail the next time.
 * So we restrict these flags.
 *
 * @example
 * const pattern = /hello/g;
 * pattern.test('hello'); // true
 * pattern.test('hello'); // false
 */
export function validateStepRegExp(pattern: RegExp, location: PlaywrightLocation) {
  const unsupportedFlags: string[] = [];
  if (pattern.global) unsupportedFlags.push('g');
  if (pattern.sticky) unsupportedFlags.push('y');
  if (!unsupportedFlags.length) return;

  const flags = unsupportedFlags.join('');
  const file = relativeToCwd(location.file);
  throw new Error(
    `Remove unsupported RegExp flags "${flags}" from step definition ${pattern} at ${file}:${location.line}.`,
  );
}
