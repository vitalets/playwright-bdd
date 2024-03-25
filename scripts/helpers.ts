/**
 * Build and install Playwright-bdd to self node_modules.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import pkg from '../package.json';

const generatedTar = `playwright-bdd-${pkg.version}.tgz`;

export function buildAndInstallPlaywrightBdd({ isCI = false } = {}) {
  try {
    runCmd('npm run build');
    runCmd('npm pack --loglevel=error');
    if (isCI) {
      // on CI remove node_modules to check that playwright-bdd brings all needed dependencies
      fs.rmSync('node_modules', { recursive: true });
      // running npm install <tarball> with --no-save does not create .bin
      runCmd(`npm install --omit=dev ${generatedTar}`);
      runCmd(`npm install @playwright/test @cucumber/cucumber`);
    } else {
      runCmd(`npm install --no-save ${generatedTar}`);
    }
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}

function runCmd(cmd: string) {
  console.log(`Running: ${cmd}`); // eslint-disable-line no-console
  execSync(cmd, { stdio: 'inherit' });
}
