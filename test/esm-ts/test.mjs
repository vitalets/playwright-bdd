import { test, getTestName, execPlaywrightTest, DEFAULT_CMD } from '../helpers.mjs';

test.skip(getTestName(import.meta), (t) => {
  execPlaywrightTest(
    t.name,
    `npx cross-env NODE_OPTIONS="--loader ts-node/esm --no-warnings" ${DEFAULT_CMD}`,
  );
});
