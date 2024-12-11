/**
 * Utility functions for filtering Playwright steps.
 */

import * as pw from '@playwright/test/reporter';
import { HookType } from './Hook';

// Playwright step categories, that can be mapped to testStep / hook in Cucumber messages
const MEANINGFUL_STEP_CATEGORIES = ['hook', 'fixture', 'test.step'];

type StepWithError = pw.TestStep & Required<Pick<pw.TestStep, 'error'>>;

export function collectStepsWithCategory(
  parent: pw.TestResult | pw.TestStep | undefined,
  category: string | string[],
) {
  const categories = Array.isArray(category) ? category : [category];
  const steps = collectStepsDfs(parent);
  return steps.filter((step) => categories.includes(step.category));
}

export function getHooksRootPwStep(result: pw.TestResult, type: HookType) {
  // 'Before Hooks' and 'After Hooks' are hardcoded in Playwright.
  // See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/worker/workerMain.ts#L336
  const rootStepTitle = type === 'before' ? 'Before Hooks' : 'After Hooks';
  return result.steps.find((step) => step.category === 'hook' && step.title === rootStepTitle);
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
 * Returns all steps in DFS order.
 * See: https://en.wikipedia.org/wiki/Depth-first_search
 */
export function collectStepsDfs(parent: pw.TestResult | pw.TestStep | undefined) {
  return (
    parent?.steps?.reduce((res: pw.TestStep[], step) => {
      res.push(step);
      res.push(...collectStepsDfs(step));
      return res;
    }, []) || []
  );
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
