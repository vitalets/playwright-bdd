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
    const cwd = 'examples';
    if (isCI) {
      // remove node_modules to check that playwright-bdd brings all needed dependencies
      fs.rmSync('node_modules', { recursive: true });
      // install playwright-bdd with peer dependencies (Playwright)
      // install typescript to be able to run tsc in examples
      runCmd(`npm install --no-save ../${generatedTar} typescript`, { cwd });
      // install playwright browsers
      runCmd(`npx playwright install --with-deps chromium`, { cwd });
    } else {
      // locally install playwright-bdd without peer dependencies to speed up installation
      runCmd(`npm install --omit=peer --no-save ../${generatedTar}`, { cwd });
    }
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}

function runCmd(cmd, opts = {}) {
  logger.log(`Running: ${cmd}`);
  execSync(cmd, { ...opts, stdio: 'inherit' });
}
