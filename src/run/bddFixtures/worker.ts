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

// Hide all BDD fixtures in reporter.
// 'box' option was added in PW 1.46,
// make type coercion to satisfy TS in early PW versions
const fixtureOptions = { scope: 'worker', box: true } as { scope: 'worker' };

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
    fixtureOptions,
  ],

  // can be overwritten in test file if there are worker hooks
  $workerHookFixtures: [({}, use) => use({}), fixtureOptions],
  $beforeAll: [
    // Important unused dependencies:
    // 1. $afterAll: in pw < 1.39 worker-scoped auto-fixtures are called in incorrect order
    // 2. $bddConfig: to load hooks before this fixtures
    async ({ $workerHookFixtures, $bddConfig }, use, $workerInfo) => {
      await runWorkerHooks('beforeAll', { $workerInfo, ...$workerHookFixtures });
      await use();
    },
    fixtureOptions,
  ],
  $afterAll: [
    // Important unused dependencies:
    // 1. $bddConfig: to load hooks before this fixtures
    async ({ $workerHookFixtures, $bddConfig }, use, $workerInfo) => {
      await use();
      await runWorkerHooks('afterAll', { $workerInfo, ...$workerHookFixtures });
    },
    fixtureOptions,
  ],
});
