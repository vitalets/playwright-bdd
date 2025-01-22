/**
 * Utility functions for filtering Playwright steps.
 */

import * as pw from '@playwright/test/reporter';
import { HooksGroup } from './Hook';
import { toArray } from '../../../utils';

/**
 * Returns root step for Before Hooks / After Hooks.
 * Strings 'Before Hooks' and 'After Hooks' are hardcoded in Playwright.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/worker/workerMain.ts#L336
 */
export function getHooksRootPwStep(result: pw.TestResult, type: HooksGroup) {
  const rootStepTitle = type === 'before' ? 'Before Hooks' : 'After Hooks';
  return result.steps.find((step) => step.category === 'hook' && step.title === rootStepTitle);
}

/**
 * Traverse steps tree per shouldEnter fn, starting from root.
 * Returns flat list of steps.
 * Graph traversal is done in BFS manner.
 */
export function walkSteps(
  root: pw.TestStep | pw.TestStep[],
  shouldEnter: (pwStep: pw.TestStep) => boolean | void = () => true,
) {
  const result: pw.TestStep[] = [];
  let curSteps = toArray(root);

  while (curSteps.length) {
    const nextSteps: pw.TestStep[] = [];
    curSteps.forEach((pwStep) => {
      if (shouldEnter(pwStep)) {
        result.push(pwStep);
        nextSteps.push(...(pwStep.steps || []));
      }
    });
    curSteps = nextSteps;
  }

  return result;
}

/**
 * Finds the deepest step that satisfies predicate function.
 */
export function findDeepestStepWith(
  pwSteps: pw.TestStep[],
  predicate: (pwStep: pw.TestStep) => boolean | void,
) {
  let result: pw.TestStep | undefined;
  let maxLevel = -1;

  pwSteps.forEach((pwStep) => {
    if (!predicate(pwStep)) return;
    const level = getStepLevel(pwStep);
    if (level > maxLevel) {
      maxLevel = level;
      result = pwStep;
    }
  });

  return result;
}

export function isUnknownDuration(pwStep: pw.TestStep) {
  return pwStep.duration === -1;
}

export function findParentWith(pwStep: pw.TestStep, predicate: (pwStep: pw.TestStep) => boolean) {
  let parent = pwStep.parent;
  while (parent) {
    if (predicate(parent)) return parent;
    parent = parent.parent;
  }
}

function getStepLevel(pwStep: pw.TestStep) {
  let level = 0;
  let parent = pwStep.parent;

  while (parent) {
    level += 1;
    parent = parent.parent;
  }

  return level;
}

export function areTestErrorsEqual(e1: pw.TestError, e2: pw.TestError) {
  // don't check location as it's object
  const keys: (keyof pw.TestError)[] = ['message', 'stack', 'value'];
  return keys.every((key) => e1[key] === e2[key]);
}

export function isTopLevelStep(pwStep: pw.TestStep) {
  return !pwStep.parent;
}

/**
 * When calling test.skip() in Playwright test, it throws an error with message:
 * "Test is skipped".
 * This error exists in step, but it is not a real error, it is a skipped step.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L223
 */
export function isSkippedError(error?: pw.TestError) {
  return Boolean(error?.message?.includes('Test is skipped:'));
}
