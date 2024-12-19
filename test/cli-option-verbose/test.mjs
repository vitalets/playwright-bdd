import {
  test,
  normalize,
  expect,
  execPlaywrightTest,
  TestDir,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (one project)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} --verbose`,
    env: { PROJECTS: 'project1' },
  });

  expect(stdout).toContain('Loading features: features/*.feature');
  expect(stdout).toContain('Resolved feature files: 1');
  expect(stdout).toContain(normalize('features/sample.feature'));

  expect(stdout).toContain('Loading steps: features/*.ts');
  expect(stdout).toContain('Resolved step files: 1');
  expect(stdout).toContain(normalize('features/steps.ts'));

  expect(stdout).toContain('Clearing output dir:');

  expect(stdout).toContain('Generating Playwright tests: 1');
  expect(stdout).toContain(normalize('.features-gen/project1/features/sample.feature.spec.js'));

  // expect(stdout).toContain('Done.');
});
