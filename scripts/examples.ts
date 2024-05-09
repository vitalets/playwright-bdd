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
import { ExecSyncOptions, execSync } from 'node:child_process';
import pkg from '../package.json';

const isCI = Boolean(process.env.CI);
const dir = process.argv[2];
const dirs = dir
  ? [dir]
  : [
      'basic', // prettier-ignore
      'cucumber-style',
      'decorators',
      'esm',
    ];
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
    runCmd(`npm install --no-save ../${generatedTar}`, { cwd: 'examples' });
  } finally {
    fs.rmSync(generatedTar, { force: true });
  }
}

function runCmd(cmd: string, opts: ExecSyncOptions = {}) {
  console.log(`Running: ${cmd}`); // eslint-disable-line no-console
  execSync(cmd, { ...opts, stdio: 'inherit' });
}
