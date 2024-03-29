/**
 * Utility functions for filtering Playwright steps.
 */

import * as pw from '@playwright/test/reporter';
import { HookType } from './Hook';

// Playwright step categoires, that can be mapped to testStep / hook in Cucumber messages
const MEANINGFUL_STEP_CATEGORIES = ['hook', 'fixture', 'test.step'];

export function collectStepsWithCategory(
  parent: pw.TestResult | pw.TestStep | undefined,
  category: string | string[],
) {
  const categories = Array.isArray(category) ? category : [category];
  const steps = collectStepsDfs(parent);
  return steps.filter((step) => categories.includes(step.category));
}

export function getHooksRootPwStep(result: pw.TestResult, type: HookType) {
  const rootStepTitle = type === 'before' ? 'Before Hooks' : 'After Hooks';
  return result.steps.find((step) => step.category === 'hook' && step.title === rootStepTitle);
}

export function findDeepestStepWithError(root?: pw.TestStep) {
  if (!root) return;
  return findDeepestStepWith(root, (pwStep) => {
    return Boolean(pwStep.error) && MEANINGFUL_STEP_CATEGORIES.includes(pwStep.category);
  });
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
  let currentStep = predicate(root) ? root : undefined;
  while (currentStep) {
    const nextStep = currentStep.steps.find((pwStep) => predicate(pwStep));
    if (!nextStep) break;
    currentStep = nextStep;
  }
  return currentStep;
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
