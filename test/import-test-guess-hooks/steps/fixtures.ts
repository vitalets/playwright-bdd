import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ option1: string }>({
  option1: ({}, use) => use('foo'),
});
export const { Given } = createBdd(test);

export const testForWorkerHook = test.extend<object, { option2: string }>({
  option2: [({}, use) => use('bar'), { scope: 'worker' }],
});
export const { BeforeAll } = createBdd(testForWorkerHook);

export const testForScenarioHook = testForWorkerHook.extend<{ option3: string }>({
  option3: ({}, use) => use('baz'),
});
export const { Before } = createBdd(testForScenarioHook);
