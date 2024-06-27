import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, playwrightVersion } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (ts-node)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    env: { NODE_OPTIONS: '--loader ts-node/esm --no-warnings' },
  });

  expect(stdout).toContain(
    `Given State 1 ${normalize('.features-gen/one/sample.feature.spec.js')}:7:11`,
  );
});

test(`${testDir.name} (pw native)`, { skip: playwrightVersion < '1.41' }, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expect(stdout).toContain(
    `Given State 1 ${normalize('.features-gen/one/sample.feature.spec.js')}:7:11`,
  );
});
