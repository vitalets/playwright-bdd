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
  if (isMainProcess()) {
    registerInputConfig(outputDir, inputConfig);
    if (!skip && !isRunFromVsCodeExtension()) {
      execBddgenSync(outputDir);
    }
  }

  return outputDir;
}

function execBddgenSync(outputDir: string) {
  const cliEntry = path.resolve(__dirname, 'gen', 'cli');
  execSync(`node "${cliEntry}" -o "${outputDir}"`, { stdio: 'inherit' });
}

function isMainProcess() {
  return !process.env.TEST_WORKER_INDEX;
}

/**
 * VS Code extension scans and executes all playwright configs.
 */
function isRunFromVsCodeExtension() {
  return (process.env.PW_TEST_REPORTER || '').includes('.vscode');
}
