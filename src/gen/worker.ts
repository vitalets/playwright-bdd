/**
 * Worker to generate test files with fresh require/import cache
 * See: https://github.com/nodejs/modules/issues/307#issuecomment-858729422
 */

import { workerData } from 'node:worker_threads';
import { generateTestFiles } from '.';

main();

async function main() {
  await generateTestFiles(workerData.config);
}
