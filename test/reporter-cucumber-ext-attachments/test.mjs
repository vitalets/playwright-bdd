import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';
import path from 'node:path';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (no attachments url)`, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTest(testDir.name);

  checkReport();
  checkAttachmentFiles();
});

test(`${testDir.name} (with attachments url)`, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTest(testDir.name, {
    env: { ATTACHMENTS_BASE_URL: 'http://localhost:12345/data' },
  });

  checkReport(`--grep-invert "protocol:file"`);
  checkAttachmentFiles();
});

function checkReport(args = '') {
  testDir.expectFileNotEmpty('actual-reports/index.html');
  execPlaywrightTest(testDir.name, {
    cmd: `npx playwright test --config check-report ${args}`,
    env: { PORT: 12345 },
  });
}

function checkAttachmentFiles() {
  const extensions = testDir
    .getAllFiles('actual-reports/data')
    .map((file) => path.extname(file))
    .sort();
  expect(extensions).toEqual(['.jpeg', '.png', '.png', '.webm', '.zip']);
}
