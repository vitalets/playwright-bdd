import {
  test,
  normalize,
  expect,
  execPlaywrightTest,
  TestDir,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} --verbose`);

  expect(stdout).toContain('Loading features: features/*.feature');
  expect(stdout).toContain('Resolved feature files: 1');
  expect(stdout).toContain(normalize('features/sample.feature'));

  expect(stdout).toContain('Loading steps: steps.ts');
  expect(stdout).toContain('Resolved step files: 1');
  expect(stdout).toContain('steps.ts');

  expect(stdout).toContain('Clearing output dir:');

  expect(stdout).toContain('Generating Playwright tests: 1');
  expect(stdout).toContain(`  ${normalize('.features-gen/features/sample.feature.spec.js')}`);
});
