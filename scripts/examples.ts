/**
 * Build and run examples
 * npm run examples
 * npm run examples -- playwright-style
 * npm run examples -- cucumber-style
 */

import path from 'node:path';
import { execSync } from 'node:child_process';
import { buildAndInstallPlaywrightBdd } from './helpers';

const dir = process.argv[2];
const dirs = dir ? [dir] : ['playwright-style', 'cucumber-style'];

buildAndInstallPlaywrightBdd();
runExamples();

function runExamples() {
  dirs.forEach((dir) => {
    const cwd = path.join('examples', dir);
    console.log(cwd); // eslint-disable-line no-console
    execSync(`npm test`, { cwd, stdio: 'inherit' });
  });
}
