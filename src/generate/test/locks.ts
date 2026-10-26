import type { StepData } from './index';
import { supportedFeatures } from '../../playwright/supportedFeatures';
import { playwrightVersion } from '../../playwright/utils';
import { exit } from '../../utils/exit';

export function collectTestLocks(
  steps: Iterable<StepData>,
  tags: string[],
  scenarioLocation: string,
): string[] {
  const locks = new Set(collectTagLocks(tags, scenarioLocation));
  for (const step of steps) {
    for (const name of getStepLocks(step)) locks.add(name);
    if (locks.size) ensureLocksSupported(`Step: ${step.location}`);
  }
  return [...locks];
}

function collectTagLocks(tags: string[], scenarioLocation: string) {
  const locks: string[] = [];
  // Collected tags already include Feature, Rule, Outline, Examples, and path tags.
  for (const tag of tags) {
    if (!tag.startsWith('@lock:')) continue;
    const name = tag.slice('@lock:'.length);
    if (!name) {
      exit(`Lock tag "${tag}" requires a nonempty name. Scenario: ${scenarioLocation}`);
    }
    ensureLocksSupported(`Tag: ${tag}. Scenario: ${scenarioLocation}`);
    locks.push(name);
  }

  return locks;
}

function ensureLocksSupported(location: string) {
  if (!supportedFeatures.testLocks) {
    exit(
      `Test locks require Playwright 1.63 or later (installed: ${playwrightVersion}).`,
      `Upgrade @playwright/test to use locks. ${location}`,
    );
  }
}

function getStepLocks(step: StepData) {
  const lock = step.matchedDefinition?.definition.providedOptions?.lock ?? [];
  return Array.isArray(lock) ? lock : [lock];
}
