/**
 * Playwright's parseStackTraceLine function.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/utilsBundle.ts#L48
 */

type StackFrame = {
  file: string;
  line: number;
  column: number;
  function?: string;
};

export function parseStackTraceLine(line: string): StackFrame | null {
  const pwCoreUtilsBundle = require('playwright-core/lib/utilsBundle');
  return pwCoreUtilsBundle?.parseStackTraceLine?.(line) || null;
}
