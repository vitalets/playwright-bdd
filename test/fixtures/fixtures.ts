import { test as base } from 'playwright-bdd';

export class TestScopedFixture {
  prop = 'initial value';
}

export class WorkerScopedFixture {
  prop = 'initial value';
}

export const test = base.extend<
  { optionFixture: string; testScopedFixture: TestScopedFixture },
  { workerScopedFixture: WorkerScopedFixture }
>({
  optionFixture: ['foo', { option: true }],
  testScopedFixture: async ({}, use) => use(new TestScopedFixture()),
  workerScopedFixture: [async ({}, use) => use(new WorkerScopedFixture()), { scope: 'worker' }],
});
