import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (--workers 1)`, () => {
  execPlaywrightTest(testDir.name, { cmd: `${BDDGEN_CMD} --workers 1` });
  testDir.expectFileExists('.features-gen/project1/sample.feature.spec.js');
  testDir.expectFileExists('.features-gen/project2/sample.feature.spec.js');
});

test(`${testDir.name} (--workers 2)`, () => {
  execPlaywrightTest(testDir.name, { cmd: `${BDDGEN_CMD} --workers 2` });
  testDir.expectFileExists('.features-gen/project1/sample.feature.spec.js');
  testDir.expectFileExists('.features-gen/project2/sample.feature.spec.js');
});

test(`${testDir.name} (default workers)`, () => {
  execPlaywrightTest(testDir.name, { cmd: BDDGEN_CMD });
  testDir.expectFileExists('.features-gen/project1/sample.feature.spec.js');
  testDir.expectFileExists('.features-gen/project2/sample.feature.spec.js');
});

test(`${testDir.name} (--workers 0 errors)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    'Invalid --workers value: "0". Must be a positive integer.',
    { cmd: `${BDDGEN_CMD} --workers 0` },
  );
});

test(`${testDir.name} (--workers abc errors)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    'Invalid --workers value: "abc". Must be a positive integer.',
    { cmd: `${BDDGEN_CMD} --workers abc` },
  );
});
