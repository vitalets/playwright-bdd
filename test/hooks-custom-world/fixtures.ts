import { test as base } from '../../dist';

export const test = base.extend<{ myFixture: string }, { myWorkerFixture: string }>({
  myFixture: ({}, use) => use('myFixture'),
  myWorkerFixture: [({}, use) => use('myWorkerFixture'), { scope: 'worker' }],
});
