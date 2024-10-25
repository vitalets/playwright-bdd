/**
 * Worker-scoped fixtures added by playwright-bdd.
 */

import { BDDConfig } from '../../config/types';
import { test as base, WorkerInfo } from '@playwright/test';
import { getConfigFromEnv } from '../../config/env';
import { getPlaywrightConfigDir } from '../../config/configDir';
import { runWorkerHooks } from '../../hooks/worker';
import { loadSteps, resolveStepFiles } from '../../steps/loader';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

// Hide all BDD fixtures in reporter.
// 'box' option was added in PW 1.46,
// make type coercion to satisfy TS in early PW versions
const fixtureOptions = { scope: 'worker', box: true } as { scope: 'worker' };

export type BddFixturesWorker = {
  $workerInfo: WorkerInfo;
  $bddConfig: BDDConfig;
  $runWorkerHooks: typeof runWorkerHooks;
};

export const test = base.extend<NonNullable<unknown>, BddFixturesWorker>({
  $workerInfo: [({}, use, $workerInfo) => use($workerInfo), fixtureOptions],
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
  $runWorkerHooks: [
    // Important unused dependency:
    // - $bddConfig: to load bdd config before hooks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ({ $bddConfig }, use) => {
      await use(runWorkerHooks);
    },
    fixtureOptions,
  ],
});
