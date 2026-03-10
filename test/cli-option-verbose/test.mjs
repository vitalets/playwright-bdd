import {
  test,
  expectSubstringLines,
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

  expectSubstringLines(
    stdout,
    `
Checking feature files at:
  - project1/**/*.feature
Found feature files (1):
  - project1/sample.feature
Checking step files at:
  - project1/**/*.{js,mjs,cjs,ts,mts,cts}
Found step files (1):
  - project1/steps.ts (1 step)
Clearing output directory: .features-gen/project1/**/*.spec.js
Generating Playwright test files (1):
  - .features-gen/project1/sample.feature.spec.js
Done
  `,
  );
});

test(`${testDir.name} (two projects)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} --verbose`,
    env: { PROJECTS: 'project1,project2' },
  });

  expectSubstringLines(
    stdout,
    `
Checking step files at:
  - project1/**/*.{js,mjs,cjs,ts,mts,cts}
Found step files (1):
  - project1/steps.ts (1 step)
Checking feature files at:
  - project1/**/*.feature
Found feature files (1):
  - project1/sample.feature
Clearing output directory: .features-gen/project1/**/*.spec.js
Generating Playwright test files (1):
  - .features-gen/project1/sample.feature.spec.js
Checking feature files at:
  - project2/*.feature
Found feature files (1):
  - project2/sample.feature
Checking step files at:
  - project2/*.ts
Found step files (2):
  - project2/steps1.ts (1 step)
  - project2/steps2.ts (2 steps)
Clearing output directory: .features-gen/project2/**/*.spec.js
Generating Playwright test files (1):
  - .features-gen/project2/sample.feature.spec.js
Done
  `,
  );
});
