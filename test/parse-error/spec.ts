import { expect, test } from '@playwright/test';
import sinon from 'sinon';
import { generateTestFiles } from '../../src/gen';

test.beforeEach(async () => {
  process.env.CUCUMBER_CONFIG = JSON.stringify({
    paths: ['test/parse-error/sample.feature'],
  });
});

test.afterEach(() => {
  sinon.restore();
});

test('parse-error', async () => {
  const consoleStub = sinon.stub(console, 'error');
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new Error(`Process exited with status code ${code}`);
  });
  await expect(generateTestFiles()).rejects.toThrow('Process exited with status code 1');
  expect(consoleStub.firstCall.args[0]).toContain('Parse error in "test/parse-error/sample.feature" (1:1)');
});
