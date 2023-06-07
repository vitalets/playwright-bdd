/**
 * Calls `npx bddgen` as child process from playwright config
 * to generate test files *synchronously*.
 */

import path from 'node:path';
import { execSync } from 'node:child_process';
import { registerInputConfig } from './config/input';
import { BDDInputConfig, getConfig } from './config';

export function generateBDDTests(inputConfig?: BDDInputConfig) {
  const { outputDir, skip } = getConfig(inputConfig);

  // generate only in main process, skip in workers
  // generate only for `playwright test`, skip other commands
  if (isMainProcess() && isTestCommand()) {
    registerInputConfig(outputDir, inputConfig);
    if (!skip) execBddgenSync(outputDir);
  }

  return outputDir;
}

function execBddgenSync(outputDir: string) {
  const cliEntry = path.resolve(__dirname, 'gen', 'cli');
  try {
    execSync(`node "${cliEntry}" -o "${outputDir}"`, { stdio: 'inherit' });
  } catch (e) {
    // error already outputed to stdio, just exit
    process.exit(1);
  }
}

function isMainProcess() {
  return !process.env.TEST_WORKER_INDEX;
}

function isTestCommand() {
  return process.argv[2] === 'test';
}
