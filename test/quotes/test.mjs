import { test, getTestName, execPlaywrightTest, DEFAULT_CMD } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name, `npx cross-env QUOTES=single; ${DEFAULT_CMD}`);
  execPlaywrightTest(t.name, `npx cross-env QUOTES=double; ${DEFAULT_CMD}`);
  execPlaywrightTest(t.name, `npx cross-env QUOTES=backtick; ${DEFAULT_CMD}`);
});
