// import { expect, test } from '@playwright/test';
// import sinon from 'sinon';

// test.afterEach(() => {
//   sinon.restore();
// });

// eslint-disable-next-line no-empty-pattern
// test('parse-error', async ({}, testInfo) => {
//   const fn = createTest();
//   const consoleStub = sinon.stub(console, 'error');
//   sinon.stub(process, 'exit').callsFake((code) => {
//     throw new Error(`Process exited with status code ${code}`);
//   });
//   await expect(fn({}, testInfo)).rejects.toThrow(
//     'Process exited with status code 1'
//   );
//   expect(consoleStub.firstCall.args[0]).toContain(
//     'Parse error in "sample.feature" (1:1)'
//   );
// });
