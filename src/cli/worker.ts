/**
 * Worker to generate test files with fresh require/import cache
 * See: https://github.com/nodejs/modules/issues/307#issuecomment-858729422
 */

import { workerData } from 'node:worker_threads';
import { TestFilesGenerator } from '../generate';

main();

async function main() {
  try {
    await new TestFilesGenerator(workerData.config).generate();
  } catch (e) {
    // eslint-disable-next-line no-console
    if (e.message) console.error(e.message);
    process.exitCode = 1;
  }
}
