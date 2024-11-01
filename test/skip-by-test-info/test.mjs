import { test, TestDir, expect, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

function runInDir(dir) {
  testDir.clearDir(`actual-reports/${dir}`);
  execPlaywrightTest(testDir.name, { env: { DIR: dir } });
  return JSON.parse(testDir.getFileContents(`actual-reports/${dir}/report.json`));
}

test(`${testDir.name} (skip in step)`, async () => {
  const report = runInDir('skip-in-step');

  const scenario1 = report[0].elements[0];
  expect(scenario1.name).toEqual('scenario with only skipped test');
  expect(scenario1.steps[0]).toMatchObject({
    name: 'skipped by test info',
    result: { status: 'skipped' },
  });

  const scenario2 = report[0].elements[1];
  expect(scenario2.name).toEqual('scenario with skipped and success tests');
  expect(scenario2.steps[0]).toMatchObject({
    name: 'skipped by test info',
    result: { status: 'skipped' },
  });
  expect(scenario2.steps[1]).toMatchObject({
    name: 'success step 1',
    result: { status: 'skipped' },
  });
});

test(`${testDir.name} (skip in before hook)`, async () => {
  const report = runInDir('skip-in-before-hook');

  const scenario1 = report[0].elements[0];
  expect(scenario1.name).toEqual('scenario 1');
  expect(scenario1.steps[0]).toMatchObject({
    keyword: 'Before',
    result: { status: 'skipped' },
  });
  expect(scenario1.steps[1]).toMatchObject({
    name: 'success step 1',
    result: { status: 'skipped' },
  });

  const scenario2 = report[0].elements[1];
  expect(scenario2.name).toEqual('scenario 2');
  expect(scenario2.steps[0]).toMatchObject({
    keyword: 'Before',
    result: { status: 'skipped' },
  });
  expect(scenario2.steps[1]).toMatchObject({
    name: 'success step 2',
    result: { status: 'skipped' },
  });
});
