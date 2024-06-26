import { test as base } from 'playwright-bdd';

export class TestScopedFixture {
  prop = 'initial value';
}

export class WorkerScopedFixture {
  prop = 'initial value';
}

class World {
  constructor(
    public testScopedFixture: TestScopedFixture,
    public workerScopedFixture: WorkerScopedFixture,
  ) {}
}

export const test = base.extend<
  { optionFixture: string; testScopedFixture: TestScopedFixture; world: World },
  { workerScopedFixture: WorkerScopedFixture }
>({
  optionFixture: ['foo', { option: true }],
  testScopedFixture: async ({}, use) => use(new TestScopedFixture()),
  workerScopedFixture: [async ({}, use) => use(new WorkerScopedFixture()), { scope: 'worker' }],
  world: async ({ testScopedFixture, workerScopedFixture }, use) =>
    use(new World(testScopedFixture, workerScopedFixture)),
});
