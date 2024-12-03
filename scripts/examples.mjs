/**
 * Run examples.
 * npm run examples
 * npm run examples basic-cjs
 * npm run examples basic-esm
 * npm run examples cucumber-style
 * npm run examples decorators
 */

import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const dir = process.argv[2];
const dirs = dir ? [dir] : getExampleDirs();
const logger = console;

runExamples();

function runExamples() {
  dirs.forEach((dir) => {
    const cwd = path.join('examples', dir);
    logger.log(cwd);
    execSync(`npm test`, { cwd, stdio: 'inherit' });
  });
}

function getExampleDirs() {
  return fs
    .readdirSync('examples', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((dir) => dir !== 'node_modules');
}
