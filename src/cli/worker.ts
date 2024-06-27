/**
 * Worker to generate test files with fresh require/import cache
 * See: https://github.com/nodejs/modules/issues/307#issuecomment-858729422
 */

import { workerData } from 'node:worker_threads';
import { TestFilesGenerator } from '../gen';
import { forceExitIfNeeded } from './helpers';

main();

async function main() {
  await new TestFilesGenerator(workerData.config).generate();
  forceExitIfNeeded();
}
