import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (default-prompt)`, async () => {
  const FEATURE = 'default-prompt';
  execPlaywrightTestWithError(testDir.name, '', {
    env: { FEATURE },
  });

  checkReports(FEATURE);
});

test(`${testDir.name} (custom-prompt)`, async () => {
  const FEATURE = 'custom-prompt';
  execPlaywrightTestWithError(testDir.name, '', {
    env: { FEATURE, PROMPT_TEMPLATE: 'my custom prompt' },
  });

  checkReports(FEATURE);
});

function checkReports(grep) {
  execPlaywrightTest(testDir.name, `npx playwright test --config check-report -g "(${grep})"`);
}
