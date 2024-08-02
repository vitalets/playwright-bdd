import path from 'node:path';
import micromatch from 'micromatch';
import { getSmokeTestDirs } from './scripts/smoke-tests.mjs';

export default {
  '**': (changedFiles) => {
    return [
      ...eslint(changedFiles), // prettier-ignore
      ...prettier(changedFiles),
      ...test(changedFiles),
    ];
  },
  '**/*.ts': () => `npm run tsc`,
  '**/*.feature': 'node scripts/no-only-in-features.mjs',
  'docs/**': () => 'npm run docs:validate',
};

function eslint(changedFiles) {
  const jsFiles = micromatch(changedFiles, '**/*.{js,mjs,ts}');
  return jsFiles.length ? [`eslint --fix --no-warn-ignored ${jsFiles.join(' ')}`] : [];
}

function prettier(changedFiles) {
  return changedFiles.length ? [`prettier --write --ignore-unknown ${changedFiles.join(' ')}`] : [];
}

function test(changedFiles) {
  const testFiles = micromatch(changedFiles, 'test/**');
  const testDirFiles = micromatch(testFiles, ['test/*/**', '!test/_helpers/**']);
  const testHelpersChanged = testDirFiles.length !== testFiles.length;
  const srcFiles = micromatch(changedFiles, 'src/**/*.{js,mjs,ts}');
  const packageFiles = micromatch(changedFiles, 'package*.json');
  const testDirs = testDirFiles.map((file) => file.split(path.sep).slice(0, 2).join(path.sep));
  // if changes only in test/* -> run only these tests
  // if changes in src|package.json -> run tests on test dirs + smoke test dirs
  if (testHelpersChanged || srcFiles.length || packageFiles.length) {
    testDirs.push(...getSmokeTestDirs());
  }
  const uniqueTestDirs = [...new Set(testDirs)];
  return uniqueTestDirs.length ? [`npm run only ${uniqueTestDirs.join(' ')}`] : [];
}
