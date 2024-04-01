import path from 'node:path';
import { getSmokeTestDirs } from './test/smoke.mjs';

export default {
  '**/*.{js,mjs,ts}': [
    'eslint --fix --no-warn-ignored',
    'prettier --write --ignore-unknown',
    (changedFiles) => {
      const changedTestDirs = extractTestDirs(changedFiles);
      // if changes only in test/* - run only these tests
      // otherwise run on smoke dirs + changed test dirs
      const finalTestDirs =
        changedTestDirs.length === changedFiles.length
          ? changedTestDirs
          : [...new Set([...getSmokeTestDirs(), changedTestDirs])];
      return `npm run only ${finalTestDirs.join(' ')}`;
    },
  ],
  '**/*.feature': 'node scripts/no-only-in-features.mjs',
  'docs/**': () => 'npm run docs:validate',
  '!**/*.{js,mjs,ts,feature}': 'prettier --write --ignore-unknown',
};

function extractTestDirs(absPaths) {
  const testDirs = absPaths
    .map((file) => path.relative(process.cwd(), file))
    .map((file) => file.split(path.sep))
    .filter((parts) => parts[0] === 'test' && parts.length > 2)
    .map((parts) => path.join(parts[0], parts[1]));
  return [...new Set(testDirs)];
}
