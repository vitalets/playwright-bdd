import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest, DEFAULT_CMD } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(
    t.name,
    `npx cross-env NODE_OPTIONS="--loader ts-node/esm --no-warnings" ${DEFAULT_CMD}`,
  );
  expect(stdout).toContain(
    `Given State 1 ${normalize('.features-gen/one/sample.feature.spec.js')}:7:11`,
  );
});
