import {
  test,
  execPlaywrightTestWithError,
  TestDir,
  BDDGEN_CMD,
  PLAYWRIGHT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'All feature files should be located underneath featuresRoot',
      /featureFile:.+features-root-error[/\\]root\.feature/,
      /featuresRoot:.+features-root-error[/\\]config/,
    ],
    `${BDDGEN_CMD} -c config && ${PLAYWRIGHT_CMD} -c config`,
  );
});
