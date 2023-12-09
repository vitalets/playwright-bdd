/**
 * Test setup
 */
import { execSync } from 'node:child_process';
import { ensureNodeVersion, getPackageVersion, removeDir } from './helpers.mjs';

!process.env.CI && ensureNodeVersion(20);
console.log(`Playwright version: ${getPackageVersion('@playwright/test')}`);
console.log(`Cucumber version: ${getPackageVersion('@cucumber/cucumber')}`);
removeDir('./test-results');
// must build project before tests as we run tests without ts-node
execSync('npm run build', { stdio: 'inherit' });
