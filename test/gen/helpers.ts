import path from 'path';
import fs from 'fs';
import { expect, TestInfo } from '@playwright/test';
import { generateTestFiles } from '../../src/gen';

export function createTest() {
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
