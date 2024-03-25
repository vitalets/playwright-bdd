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
    runCmd('npm pack');
    if (isCI) {
      // on CI remove node_modules to check that playwright-bdd brings all needed dependencies
      fs.rmSync('node_modules', { recursive: true });
      // on CI install globally, b/c install from tar.gz locally does not setup .bin
      // see: https://stackoverflow.com/questions/72368342/is-there-a-way-to-get-npm-install-to-install-bin-executables-in-the-local-node
      runCmd(`npm install --global --omit=dev ${generatedTar}`);
      runCmd(`npm install --no-save @playwright/test @cucumber/cucumber`);
    } else {
      runCmd(`npm install --no-save ${generatedTar}`);
    }
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}

function runCmd(cmd: string) {
  execSync(cmd, { stdio: 'inherit' });
}
