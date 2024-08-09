/**
 * Worker-scoped fixtures added by playwright-bdd.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { BDDConfig } from '../../config/types';
import { test as base } from '@playwright/test';
import { getConfigFromEnv } from '../../config/env';
import { getPlaywrightConfigDir } from '../../config/configDir';
import { runWorkerHooks } from '../../hooks/worker';
import { loadSteps, resolveStepFiles } from '../../steps/load';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

export type BddFixturesWorker = {
  $bddConfig: BDDConfig;
  $workerHookFixtures: Record<string, unknown>;
  $beforeAll: void;
  $afterAll: void;
};

export const test = base.extend<NonNullable<unknown>, BddFixturesWorker>({
  $bddConfig: [
    async ({}, use, workerInfo) => {
      const config = getConfigFromEnv(workerInfo.project.testDir);
      const cwd = getPlaywrightConfigDir();
      const stepFiles = await resolveStepFiles(cwd, config.steps);
      await loadSteps(stepFiles);
      await use(config);
    },
    { scope: 'worker' },
  ],

  // can be overwritten in test file if there are worker hooks
  $workerHookFixtures: [({}, use) => use({}), { scope: 'worker' }],
  $beforeAll: [
    // Important unused dependencies:
    // 1. $afterAll: in pw < 1.39 worker-scoped auto-fixtures are called in incorrect order
    // 2. $bddConfig: to load hooks before this fixtures
    async ({ $workerHookFixtures, $bddConfig }, use, $workerInfo) => {
      await runWorkerHooks('beforeAll', { $workerInfo, ...$workerHookFixtures });
      await use();
    },
    { scope: 'worker' },
  ],
  $afterAll: [
    // Important unused dependencies:
    // 1. $bddConfig: to load hooks before this fixtures
    async ({ $workerHookFixtures, $bddConfig }, use, $workerInfo) => {
      await use();
      await runWorkerHooks('afterAll', { $workerInfo, ...$workerHookFixtures });
    },
    { scope: 'worker' },
  ],
});
