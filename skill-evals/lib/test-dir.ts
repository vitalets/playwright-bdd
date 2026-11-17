import { createHash } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { EvalTestContext } from './test-context.ts';

export async function createTestDir(context: EvalTestContext) {
  const { testTitle, testPath } = context;
  const name = titleToDirectory(testTitle);
  const directory = path.join(path.dirname(testPath), 'test-results', name);
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  context.diagnostic?.(`Evaluation output: ${directory}`);
  return directory;
}

function titleToDirectory(title: string) {
  // Match Playwright's filename sanitization without adding a file or project prefix.
  // eslint-disable-next-line no-control-regex
  const sanitized = title.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');
  if (Buffer.byteLength(sanitized) <= 100) return sanitized;
  const hash = createHash('sha256').update(title).digest('hex').slice(0, 8);
  let prefix = '';
  for (const character of sanitized) {
    if (Buffer.byteLength(prefix + character) > 90) break;
    prefix += character;
  }
  return `${prefix}-${hash}`;
}
