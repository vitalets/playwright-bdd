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

test(`${testDir.name} (custom prompt)`, { skip }, async () => {
  execPlaywrightTestWithError(testDir.name, '', {
    env: { TAGS: '@default-page', PROMPT_TEMPLATE: 'my custom prompt' },
  });

  checkReports('(custom prompt)');
});

test(`${testDir.name} (custom page)`, { skip }, async () => {
  execPlaywrightTestWithError(testDir.name, '', {
    env: { TAGS: '@custom-page' },
  });

  checkReports('(custom page)');
});

// run default prompt last to keep it in report files, for manual checking prompt
test(`${testDir.name} (default prompt)`, { skip }, async () => {
  execPlaywrightTestWithError(testDir.name, '', {
    env: { TAGS: '@default-page' },
  });

  checkReports('(default prompt)');
});

function checkReports(grep) {
  testDir.expectFileNotEmpty('actual-reports/report.html');
  execPlaywrightTest(testDir.name, `npx playwright test --config check-report -g "${grep}"`);
}
