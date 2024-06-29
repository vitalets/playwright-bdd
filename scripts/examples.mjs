/**
 * Build and run examples
 * npm run examples
 * npm run examples basic
 * npm run examples cucumber-style
 * npm run examples decorators
 * npm run examples esm
 */

import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import fg from 'fast-glob';

const pkg = JSON.parse(fs.readFileSync('./package.json'));
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
    // todo: on CI remove node_modules to check that playwright-bdd brings all needed dependencies
    // isCI && fs.rmSync('node_modules', { recursive: true });
    // isCI && runCmd(`npm install @playwright/test @cucumber/cucumber cross-env ts-node`, { cwd: 'examples' });
    runCmd(`npm install --omit=peer --no-save ../${generatedTar}`, { cwd: 'examples' });
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
