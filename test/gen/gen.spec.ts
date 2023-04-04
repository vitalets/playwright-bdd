import path from 'path';
import fs from 'fs';
import { expect, test, TestInfo } from '@playwright/test';
import { generateTestFiles } from '../../src/gen';

test('scenario', createTest());
test('scenario-outline', createTest());
test('background', createTest());
test('doc-string', createTest());
test('data-table', createTest());

function createTest() {
  // eslint-disable-next-line
  return async ({}: any, testInfo: TestInfo) => {
    const cwd = path.resolve('test', 'gen', testInfo.title);
    const cucumberConfig = path.join('..', 'cucumber.js');
    const [actualFilePath] = await generateTestFiles({ cwd, cucumberConfig });
    expectFilesEqual(actualFilePath, path.join(cwd, 'expected.spec.js'));
  };
}

function expectFilesEqual(actualPath: string, expectedPath: string) {
  const actualContent = fs.readFileSync(actualPath, 'utf8');
  const expectedContent = fs.readFileSync(expectedPath, 'utf8');
  expect(actualContent).toEqual(expectedContent);
}
