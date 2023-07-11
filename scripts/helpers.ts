/**
 * Build and install Playwright-bdd to self node_modules.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import pkg from '../package.json';

const generatedTar = `playwright-bdd-${pkg.version}.tgz`;

export function buildAndInstallPlaywrightBdd() {
  try {
    execSync('npm run build', { stdio: 'inherit' });
    execSync('npm pack', { stdio: 'inherit' });
    execSync(`npm install --no-save ${generatedTar}`, { stdio: 'inherit' });
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}
