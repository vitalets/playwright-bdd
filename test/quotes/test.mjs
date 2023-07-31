import { test, getTestName, execPlaywrightTest, DEFAULT_CMD } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name, `(export QUOTES=single; ${DEFAULT_CMD})`);
  execPlaywrightTest(t.name, `(export QUOTES=double; ${DEFAULT_CMD})`);
  execPlaywrightTest(t.name, `(export QUOTES=backtick; ${DEFAULT_CMD})`);
});
