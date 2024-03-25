/**
 * Build and install Playwright-bdd to self node_modules.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import pkg from '../package.json';

const generatedTar = `playwright-bdd-${pkg.version}.tgz`;

export function buildAndInstallPlaywrightBdd({ removeNodeModules = false } = {}) {
  try {
    runCmd('npm run build');
    runCmd('npm pack');
    if (removeNodeModules) {
      fs.rmSync('node_modules', { recursive: true });
    }
    runCmd(`npm install --omit=dev --no-save ${generatedTar}`);
    if (removeNodeModules) {
      runCmd(`npm install --no-save @playwright/test @cucumber/cucumber`);
    }
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}

function runCmd(cmd: string) {
  execSync(cmd, { stdio: 'inherit' });
}
