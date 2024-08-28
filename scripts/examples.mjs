/**
 * Build and run examples
 * npm run examples
 * npm run examples basic-cjs
 * npm run examples basic-esm
 * npm run examples cucumber-style
 * npm run examples decorators
 */

import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import fg from 'fast-glob';

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const isCI = Boolean(process.env.CI);
const dir = process.argv[2];
const dirs = dir ? [dir] : getExampleDirs();
const generatedTar = `playwright-bdd-${pkg.version}.tgz`;

buildAndInstallPlaywrightBdd();
runExamples();

function runExamples() {
  dirs.forEach((dir) => {
    const cwd = path.join('examples', dir);
    console.log(cwd); // eslint-disable-line no-console
    execSync(`npm test`, { cwd, stdio: 'inherit' });
  });
}

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
  console.log(`Running: ${cmd}`); // eslint-disable-line no-console
  execSync(cmd, { ...opts, stdio: 'inherit' });
}

function getExampleDirs() {
  return fg
    .sync('**', {
      cwd: 'examples',
      deep: 1,
      onlyDirectories: true,
    })
    .filter((dir) => dir !== 'node_modules');
}
