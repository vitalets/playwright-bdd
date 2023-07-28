import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name);
  expectFileExists('.features-gen/root.feature.spec.js');
  expectFileExists('.features-gen/abs-path.feature.spec.js');
  expectFileExists('.features-gen/subdir/subdir.feature.spec.js');
  expectFileExists('.features-gen/rel-path.feature.spec.js');
});

function expectFileExists(file) {
  const absPath = new URL(file, import.meta.url);
  assert(fs.existsSync(absPath), `Missing file: ${file}`);
}
