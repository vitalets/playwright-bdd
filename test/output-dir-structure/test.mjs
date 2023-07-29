import { test, getTestName, execPlaywrightTest, expectFileExists } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name);
  expectFileExists(import.meta, '.features-gen/root.feature.spec.js');
  expectFileExists(import.meta, '.features-gen/abs-path.feature.spec.js');
  expectFileExists(import.meta, '.features-gen/subdir/subdir.feature.spec.js');
  expectFileExists(import.meta, '.features-gen/rel-path.feature.spec.js');
});
