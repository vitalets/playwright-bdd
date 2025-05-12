import {
  test,
  TestDir,
  playwrightVersion,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// Aria snapshots appeared in Playwright 1.49
const skip = playwrightVersion < '1.49.0';

test(`${testDir.name} (default-prompt)`, { skip }, async () => {
  const FEATURE = 'default-prompt';
  execPlaywrightTestWithError(testDir.name, '', {
    env: { FEATURE },
  });

  checkReports(FEATURE);
});

test(`${testDir.name} (custom-prompt)`, { skip }, async () => {
  const FEATURE = 'custom-prompt';
  execPlaywrightTestWithError(testDir.name, '', {
    env: { FEATURE, PROMPT_TEMPLATE: 'my custom prompt' },
  });

  checkReports(FEATURE);
});

function checkReports(grep) {
  execPlaywrightTest(testDir.name, `npx playwright test --config check-report -g "(${grep})"`);
}
