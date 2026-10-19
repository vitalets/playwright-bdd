import type { StepData } from './index';
import { supportedFeatures } from '../../playwright/supportedFeatures';
import { playwrightVersion } from '../../playwright/utils';
import { exit } from '../../utils/exit';

export function collectTestLocks(steps: Iterable<StepData>): string[] {
  const locks = new Set<string>();
  for (const step of steps) {
    for (const name of getStepLocks(step)) locks.add(name);

    if (locks.size && !supportedFeatures.testLocks) {
      exit(
        `Test locks require Playwright 1.63 or later (installed: ${playwrightVersion}).`,
        `Upgrade @playwright/test to use locks. Step: ${step.location}`,
      );
    }
  }
  return [...locks];
}

function getStepLocks(step: StepData) {
  const lock = step.matchedDefinition?.definition.providedOptions?.lock ?? [];
  return Array.isArray(lock) ? lock : [lock];
}
