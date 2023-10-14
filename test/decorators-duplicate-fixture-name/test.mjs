import { test, TestDir, execPlaywrightTestWithError } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `Duplicate fixture name "todoPage" defined for classes: TodoPage, TodoPage2`,
  ]),
);
