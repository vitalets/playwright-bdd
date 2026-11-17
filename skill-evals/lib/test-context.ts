import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type RunnerTestContext = {
  name?: string;
  title?: string;
  task?: { name?: string };
  filePath?: string;
  file?: string;
  signal?: AbortSignal;
  diagnostic?: (message: string) => void;
};

export type EvalTestContext = {
  testTitle: string;
  testPath: string;
  signal?: AbortSignal;
  diagnostic?: (message: string) => void;
};

export function createTestContext(t: RunnerTestContext, location?: string | URL): EvalTestContext {
  const testTitle = resolveTestTitle(t);
  const testPath = resolveTestFile(location ?? t.filePath ?? t.file);
  return {
    testTitle,
    testPath,
    signal: t.signal,
    diagnostic: typeof t.diagnostic === 'function' ? t.diagnostic.bind(t) : undefined,
  };
}

function resolveTestTitle(t: RunnerTestContext) {
  // Node exposes name, Playwright exposes title, and Vitest exposes task.name.
  const testTitle = t.name ?? t.title ?? t.task?.name;
  if (typeof testTitle !== 'string' || !testTitle.trim()) {
    throw new Error('createEval requires a test context with name, title, or task.name.');
  }
  return testTitle;
}

function resolveTestFile(location?: string | URL) {
  if (location instanceof URL) return fileURLToPath(location);
  if (typeof location !== 'string' || !location.trim()) {
    throw new Error(
      'Cannot determine the test file. Pass a filesystem path or file URL to createEval(t, location).',
    );
  }
  return location.startsWith('file:') ? fileURLToPath(location) : path.resolve(location);
}
