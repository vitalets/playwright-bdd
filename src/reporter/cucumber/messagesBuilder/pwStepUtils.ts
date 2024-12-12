/**
 * Utility functions for filtering Playwright steps.
 */

import * as pw from '@playwright/test/reporter';
import { HookType } from './Hook';
import { toArray } from '../../../utils';

// Playwright step categories, that can be mapped to testStep / hook in Cucumber messages
const MEANINGFUL_STEP_CATEGORIES = ['hook', 'fixture', 'test.step'];

type StepWithError = pw.TestStep & Required<Pick<pw.TestStep, 'error'>>;

/**
 * Returns root step for Before Hooks / After Hooks.
 * Strings 'Before Hooks' and 'After Hooks' are hardcoded in Playwright.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/worker/workerMain.ts#L336
 */
export function getHooksRootPwStep(result: pw.TestResult, type: HookType) {
  const rootStepTitle = type === 'before' ? 'Before Hooks' : 'After Hooks';
  return result.steps.find((step) => step.category === 'hook' && step.title === rootStepTitle);
}

export function findAllStepsWithCategory(result: pw.TestResult, category: string | string[]) {
  const categories = Array.isArray(category) ? category : [category];
  return findAllStepsWith(result.steps, (pwStep) => categories.includes(pwStep.category));
}

export function findDeepestStepWithError(root?: pw.TestStep) {
  if (!root) return;
  return findDeepestStepWith(root, (pwStep) => {
    return Boolean(pwStep.error) && MEANINGFUL_STEP_CATEGORIES.includes(pwStep.category);
  }) as StepWithError | undefined;
}

export function findDeepestStepWithUnknownDuration(root?: pw.TestStep) {
  if (!root) return;
  return findDeepestStepWith(root, (pwStep) => {
    return isUnknownDuration(pwStep) && MEANINGFUL_STEP_CATEGORIES.includes(pwStep.category);
  });
}

/**
 * Finds the deepest step that satisfies predicate function.
 */
function findDeepestStepWith(root: pw.TestStep, predicate: (pwStep: pw.TestStep) => boolean) {
  let result: pw.TestStep | undefined;
  let curSteps = [root];

  while (curSteps.length) {
    const nextSteps: pw.TestStep[] = [];
    curSteps.forEach((pwStep) => {
      if (predicate(pwStep)) result = pwStep;
      nextSteps.push(...(pwStep.steps || []));
    });
    curSteps = nextSteps;
  }

  return result;
}

/**
 * Find all steps that satisfies predicate function.
 */
export function findAllStepsWith(
  root: pw.TestStep | pw.TestStep[] | undefined,
  predicate: (pwStep: pw.TestStep) => unknown,
) {
  const result: pw.TestStep[] = [];
  let curSteps = root ? toArray(root) : [];

  while (curSteps.length) {
    const nextSteps: pw.TestStep[] = [];
    curSteps.forEach((pwStep) => {
      if (predicate(pwStep)) result.push(pwStep);
      nextSteps.push(...(pwStep.steps || []));
    });
    curSteps = nextSteps;
  }

  return result;
}

export function isUnknownDuration(pwStep: pw.TestStep) {
  return pwStep.duration === -1;
}

export function findParent(pwStep: pw.TestStep, predicate: (pwStep: pw.TestStep) => boolean) {
  let parent = pwStep.parent;
  while (parent) {
    if (predicate(parent)) return parent;
    parent = parent.parent;
  }
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
