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

  assertProject1(stdout);

  expect(stdout).toContain('Done');
});

test(`${testDir.name} (two projects)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} --verbose`,
    env: { PROJECTS: 'project1,project2' },
  });

  assertProject1(stdout);
  assertProject2(stdout);

  expect(stdout).toContain('Done');
});

function assertProject1(stdout) {
  expect(stdout).toContain(`Loading features: project1/**/*.feature`);
  expect(stdout).toContain('Found feature files: 1');
  expect(stdout).toContain(normalize(`project1/sample.feature`));

  expect(stdout).toContain(`Loading steps: project1/**/*.{js,mjs,cjs,ts,mts,cts}`);
  expect(stdout).toContain('Found step files: 1');
  expect(stdout).toContain(`${normalize(`project1/steps.ts`)} (1 step)`);

  expect(stdout).toContain('Clearing output dir:');

  expect(stdout).toContain('Generating Playwright test files: 1');
  expect(stdout).toContain(normalize(`.features-gen/project1/sample.feature.spec.js`));
}

function assertProject2(stdout) {
  expect(stdout).toContain(`Loading features: project2/*.feature`);
  expect(stdout).toContain('Found feature files: 1');
  expect(stdout).toContain(normalize(`project2/sample.feature`));

  expect(stdout).toContain(`Loading steps: project2/*.ts`);
  expect(stdout).toContain('Found step files: 2');
  expect(stdout).toContain(`${normalize(`project2/steps1.ts`)} (1 step)`);
  expect(stdout).toContain(`${normalize(`project2/steps2.ts`)} (2 steps)`);

  expect(stdout).toContain('Clearing output dir:');

  expect(stdout).toContain('Generating Playwright test files: 1');
  expect(stdout).toContain(normalize(`.features-gen/project2/sample.feature.spec.js`));
}
