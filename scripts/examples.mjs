/**
 * Build and run examples
 * npm run examples
 * npm run examples basic-cjs
 * npm run examples basic-esm
 * npm run examples cucumber-style
 * npm run examples decorators
 */

import path from 'node:path';
import { execSync } from 'node:child_process';
import fg from 'fast-glob';

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
  return fg
    .sync('**', {
      cwd: 'examples',
      deep: 1,
      onlyDirectories: true,
    })
    .filter((dir) => dir !== 'node_modules');
}
