/**
 * Outputs subset of tests for the smoke run.
 * Smoke tests are detected by 'smoke: true' field in the package.json file.
 *
 * Usage:
 * node test/smoke.mjs
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export function getSmokeTestDirs() {
  return fs
    .readdirSync('test')
    .filter((dir) => {
      const pkgJsonPath = `test/${dir}/package.json`;
      if (fs.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath));
        return pkg.smoke;
      }
    })
    .map((dir) => path.join('test', dir));
}

if (isCalledFromCli()) {
  process.stdout.write(getSmokeTestDirs().join(' '));
}

// See: https://github.com/nodejs/node/issues/49440#issuecomment-1703467440
function isCalledFromCli() {
  return fileURLToPath(import.meta.url) === process.argv[1];
}
