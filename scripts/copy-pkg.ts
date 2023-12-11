/**
 * Script to copy package.json to all test dirs.
 * Used once, but can be useful futher.
 *
 * Usage:
 * npx ts-node scripts/copy-pkg
 */
import fs from 'node:fs';

const SOURCE_FILE = 'test/package.json';
const EXCLUDE_DIRS = ['node_modules', 'cjs', 'esm', 'esm-ts'];

const testDirs = fs
  .readdirSync('./test', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => !EXCLUDE_DIRS.includes(entry.name))
  .map((entry) => entry.name);

testDirs.forEach((dir) => {
  const dest = `test/${dir}/package.json`;
  fs.copyFileSync(SOURCE_FILE, dest);
  // eslint-disable-next-line no-console
  console.log(`Copied ${SOURCE_FILE} -> ${dest}`);
});
