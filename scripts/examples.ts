/**
 * Build and run examples
 * npm run examples
 * npm run examples basic
 * npm run examples cucumber-style
 * npm run examples decorators
 * npm run examples esm
 */

import path from 'node:path';
import { execSync } from 'node:child_process';
import { buildAndInstallPlaywrightBdd } from './helpers';

const dir = process.argv[2];
const dirs = dir ? [dir] : ['basic', 'cucumber-style', 'decorators', 'esm'];

buildAndInstallPlaywrightBdd({
  // on CI remove node_modules to check that playwright-bdd brings all needed dependencies
  removeNodeModules: Boolean(process.env.CI),
});
runExamples();

function runExamples() {
  dirs.forEach((dir) => {
    const cwd = path.join('examples', dir);
    console.log(cwd); // eslint-disable-line no-console
    execSync(`npm test`, { cwd, stdio: 'inherit' });
  });
}
