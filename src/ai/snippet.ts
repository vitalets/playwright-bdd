import fs from 'node:fs';
import path from 'node:path';
import { TestInfoError } from '@playwright/test';
import { stripAnsiEscapes } from '../utils/stripAnsiEscapes';
import { parseStackTraceLine } from '../playwright/parseStackTraceLine';

const filesCache = new Map<string, string>();

/**
 * Get code snippet by the error stack.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/reporters/internalReporter.ts#L115
 *
 * Some downside here is that it's done in a test worker, not in the reporter process.
 */
export function getCodeSnippet(error: TestInfoError) {
  const location = getErrorLocation(error);
  if (!location?.file || !location.line) return;

  const source = getFileContent(location.file);
  const lines = source.split('\n');
  const snippetLines = lines.slice(location.line - 3, location.line + 4);

  return trimEmptyLines(snippetLines).join('\n');
}

/**
 * Extracts location of the first user's file in error stack trace.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/reporters/base.ts#L466
 */
// eslint-disable-next-line visual/complexity
function getErrorLocation(error: TestInfoError) {
  const lines = stripAnsiEscapes(error.stack || '').split('\n');
  let firstStackLine = lines.findIndex((line) => line.startsWith('    at '));
  if (firstStackLine === -1) firstStackLine = lines.length;
  const stackLines = lines.slice(firstStackLine);
  for (const line of stackLines) {
    const frame = parseStackTraceLine(line);
    if (!frame || !frame.file || belongsToNodeModules(frame.file)) continue;
    return { file: frame.file, column: frame.column || 0, line: frame.line || 0 };
  }
}

function getFileContent(file: string) {
  let content = filesCache.get(file);
  if (content === undefined) {
    content = readFileSyncSafe(file);
    filesCache.set(file, content);
  }
  return content;
}

function readFileSyncSafe(file: string) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function belongsToNodeModules(file: string) {
  return file.includes(`${path.sep}node_modules${path.sep}`);
}

function trimEmptyLines(lines: string[]) {
  const start = lines.findIndex((line) => !line.trim());
  const end = lines.findLastIndex((line) => !line.trim());
  return start === -1 ? [] : lines.slice(start, end + 1);
}
