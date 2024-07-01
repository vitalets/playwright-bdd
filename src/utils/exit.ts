/**
 * Exit utils.
 *
 * When calling process.exit() in worker thread used for test-file generation,
 * logs are not flushed (https://github.com/vitalets/playwright-bdd/issues/59).
 * That's why instead of process.exit we throw ExitError
 * that just sets process.exitCode = 1 and allow program to exit normally.
 * This esnured by wrapping code with withExitHandler().
 *
 * On the other hand, when running in the main thread, especially inside Playwright,
 * thrown error is captured by Playwright and show with additional messages (e.g. no tests found).
 * That's why in main thread we to call process.exit() to show only needed error.
 *
 * Relevant discussions:
 * - https://github.com/nodejs/node/issues/6379
 * - https://github.com/nodejs/node-v0.x-archive/issues/3737
 * - https://github.com/cucumber/cucumber-js/pull/123
 */

import { isMainThread } from 'node:worker_threads';

class ExitError extends Error {
  get stack() {
    return '';
  }
}

export async function withExitHandler(fn: () => unknown) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ExitError) {
      // eslint-disable-next-line no-console, max-depth
      if (e.message) console.error(e.message);
      process.exitCode = 1;
    } else {
      throw e;
    }
  }
}

export function exit(...messages: string[]): never {
  messages = messages.filter(Boolean);
  if (isMainThread) {
    // use console.error() here instead of logger.error() to have less stack
    // for flushing messages to stderr.
    // eslint-disable-next-line no-console
    if (messages.length) console.error('Error:', ...messages);
    process.exit(1);
  } else {
    throw new ExitError(messages.join(' '));
  }
}
