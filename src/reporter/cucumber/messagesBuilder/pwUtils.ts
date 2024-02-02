/**
 * Utility functions for filtering Playwright steps.
 */

import * as pw from '@playwright/test/reporter';
import { HookType } from './Hook';

// eslint-disable-next-line complexity
export function filterPlaywrightStepsDeep(
  root: pw.TestResult | pw.TestStep | undefined,
  fn: (step: pw.TestStep) => unknown,
) {
  const result: pw.TestStep[] = [];
  const stack = root?.steps.slice() || [];
  while (stack.length) {
    const step = stack.shift();
    if (step && fn(step)) result.push(step);
    stack.unshift(...(step?.steps || []));
  }

  return result;
}

export function getPlaywrightStepsWithCategory(
  root: pw.TestResult | pw.TestStep | undefined,
  category: 'test.step' | 'attach',
) {
  return filterPlaywrightStepsDeep(root, (step) => step.category === category);
}

export function getHooksRootStep(result: pw.TestResult, type: HookType) {
  const rootStepTitle = type === 'before' ? 'Before Hooks' : 'After Hooks';
  return result.steps.find((step) => step.category === 'hook' && step.title === rootStepTitle);
}

/**
 * Drills down to the deepest error step.
 */
export function findDeepestErrorStep(root?: pw.TestStep) {
  let errorStep = root?.error ? root : null;
  while (errorStep) {
    const nextErrorStep = errorStep.steps.find((step) => {
      return step.error && ['test.step', 'fixture', 'hook'].includes(step.category);
    });
    if (!nextErrorStep) break;
    errorStep = nextErrorStep;
  }
  return errorStep;
}
