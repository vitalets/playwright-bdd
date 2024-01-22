/**
 * Copied from Playwright.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/reporters/base.ts#L529
 *
 * Note: there is also 'strip-ansi' package, but is't ESM only.
 * Adding it is tricky now.
 * See: https://www.npmjs.com/package/strip-ansi
 */
const ansiRegex = new RegExp(
  // eslint-disable-next-line max-len, no-control-regex
  '([\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~])))',
  'g',
);

export function stripAnsiEscapes(str: string): string {
  return str.replace(ansiRegex, '');
}
