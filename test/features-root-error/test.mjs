import { test, execPlaywrightTestWithError, TestDir } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'All feature files should be located underneath featuresRoot',
      /featureFile:.+features-root-error\/root\.feature/,
      /featuresRoot:.+features-root-error\/config/,
    ],
    'node ../../dist/cli -c config && npx playwright test -c config',
  );
});
