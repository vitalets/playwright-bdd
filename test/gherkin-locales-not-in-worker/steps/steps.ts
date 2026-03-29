import path from 'node:path';
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given } = createBdd();

function isModuleLoaded(moduleName: string) {
  const key = moduleName.replaceAll('/', path.sep);
  return Object.keys(require.cache).some((cachedPath) =>
    cachedPath.includes(`${path.sep}${key}${path.sep}`),
  );
}

Given('gherkin library is not loaded in worker', () => {
  // @cucumber/messages IS used by the runtime, so it must be loaded (proves the cache check works)
  expect(
    isModuleLoaded('@cucumber/messages'),
    'Expected @cucumber/messages to be loaded in worker',
  ).toBe(true);

  // @cucumber/gherkin contains all locale/dialect data and must NOT be loaded in workers
  expect(
    isModuleLoaded('@cucumber/gherkin'),
    'Expected @cucumber/gherkin not to be loaded in worker',
  ).toBe(false);
});
