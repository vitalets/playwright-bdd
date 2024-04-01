import { test, getTestName, execPlaywrightTest, DEFAULT_CMD } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name);
  execPlaywrightTest(t.name, `${DEFAULT_CMD} --project=project-two`);
});
