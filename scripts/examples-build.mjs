/**
 * Build playwright-bdd to run examples.
 * npm run examples:build
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const isCI = Boolean(process.env.CI);
const generatedTar = `playwright-bdd-${pkg.version}.tgz`;
const logger = console;

buildAndInstallPlaywrightBdd();

function buildAndInstallPlaywrightBdd() {
  try {
    runCmd('npm run build');
    runCmd('npm pack --loglevel=error');
    // on CI remove node_modules to check that playwright-bdd brings all needed dependencies
    if (isCI) fs.rmSync('node_modules', { recursive: true });
    if (!isCI) runCmd(`npm install --omit=peer --no-save ../${generatedTar}`, { cwd: 'examples' });
    if (isCI) runCmd(`npm install --no-save ../${generatedTar}`, { cwd: 'examples' });
    if (isCI) runCmd(`npx playwright install --with-deps chromium`, { cwd: 'examples' });
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}

function runCmd(cmd, opts = {}) {
  logger.log(`Running: ${cmd}`);
  execSync(cmd, { ...opts, stdio: 'inherit' });
}
