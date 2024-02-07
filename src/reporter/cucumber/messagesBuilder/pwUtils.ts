/**
 * Utility functions for filtering Playwright steps.
 */

import * as pw from '@playwright/test/reporter';
import { HookType } from './Hook';

// Playwright step categoires, that can be mapped to testStep / hook in Cucumber report
const MEANINGFUL_STEP_CATEGORIES = ['hook', 'fixture', 'test.step'];

export function collectStepsWithCategory(
  parent: pw.TestResult | pw.TestStep | undefined,
  category: string | string[],
) {
  const categories = Array.isArray(category) ? category : [category];
  const steps = collectStepsDfs(parent);
  return steps.filter((step) => categories.includes(step.category));
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
      return step.error && MEANINGFUL_STEP_CATEGORIES.includes(step.category);
    });
    if (!nextErrorStep) break;
    errorStep = nextErrorStep;
  }
  return errorStep;
}

// eslint-disable-next-line complexity
export function filterPlaywrightStepsDeep(
  parent: pw.TestResult | pw.TestStep | undefined,
  fn: (step: pw.TestStep) => unknown,
) {
  const result: pw.TestStep[] = [];
  const stack = parent?.steps.slice() || [];
  while (stack.length) {
    const step = stack.shift();
    if (step && fn(step)) result.push(step);
    stack.unshift(...(step?.steps || []));
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
