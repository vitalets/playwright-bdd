import { test as base } from '../../dist';

class TestScopedFixture {
  prop = 'initial value';
}

class WorkerScopedFixture {
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
