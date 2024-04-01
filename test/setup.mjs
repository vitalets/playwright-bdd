/**
 * Test setup
 */
import { execSync } from 'node:child_process';
import { ensureNodeVersion, getPackageVersion } from './_helpers/index.mjs';

!process.env.CI && ensureNodeVersion(20);
showVersion('@playwright/test');
showVersion('@playwright/experimental-ct-react');
showVersion('@cucumber/cucumber');
// must build project before tests as we run tests without ts-node
execSync('npm run build', { stdio: 'inherit' });

function showVersion(pkg) {
  console.log(`Version of ${pkg}: ${getPackageVersion(pkg)}`);
}
