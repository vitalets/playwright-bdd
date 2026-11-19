import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

const generatedFiles = [
  'features/abs-path.feature.spec.js',
  'features/markdown.md.spec.js',
  'features/rel-path.feature.spec.js',
  'features/root.feature.spec.js',
  'features/subdir/subdir.feature.spec.js',
];

const handWrittenFiles = ['features/subdir/hand-written.spec.js', 'hand-written.spec.js'];

test(testDir.name, () => {
  testDir.clearDir('.features-gen');
  execPlaywrightTest(testDir.name);
  expect(getOutputDirFiles()).toEqual(generatedFiles);
});

test(`${testDir.name}: keep hand-written spec files`, () => {
  testDir.clearDir('.features-gen');
  writeHandWrittenFiles();
  const stdout = execPlaywrightTest(testDir.name);
  expect(getOutputDirFiles()).toEqual([...generatedFiles, ...handWrittenFiles].sort());
  expect(stdout).toContain(`${generatedFiles.length + handWrittenFiles.length} passed`);
});

test(`${testDir.name}: remove stale generated files`, () => {
  testDir.clearDir('.features-gen');
  execPlaywrightTest(testDir.name, BDDGEN_CMD);
  writeHandWrittenFiles();
  expect(getOutputDirFiles()).toEqual([...generatedFiles, ...handWrittenFiles].sort());
  // No scenarios match the tag, so all files from the previous run become stale.
  execPlaywrightTest(testDir.name, `${BDDGEN_CMD} --tags @no-such-tag`);
  expect(getOutputDirFiles()).toEqual(handWrittenFiles);
});

function writeHandWrittenFiles() {
  handWrittenFiles.forEach((file) => {
    testDir.writeFile(
      `.features-gen/${file}`,
      [`import { test } from '@playwright/test';`, '', `test('hand-written', () => {});`].join(
        '\n',
      ),
    );
  });
}

function getOutputDirFiles() {
  return testDir.getAllFiles('.features-gen').sort();
}
