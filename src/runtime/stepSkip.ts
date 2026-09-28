/**
 * $step.skip(): skips the current step, while the rest of the scenario keeps running.
 *
 * It relies on Playwright's own step skip, TestStepInfo.skip(), added in Playwright 1.51.
 * Playwright stops the step body, marks the step as skipped and goes on with the next step.
 * Cucumber reports show such a step as SKIPPED, see TestStepRun.ts.
 */
import { PwTestStepInfo } from '../playwright/types';

export type StepSkip = {
  (): void;
  (condition: boolean, description?: string): void;
};

// Errors thrown by $step.skip(). Playwright catches them when the step finishes,
// they are kept here only to tell a skipped step from a failed one.
const stepSkipErrors = new WeakSet<object>();

/**
 * Creates $step.skip() for the step that is running now.
 * Playwright passes TestStepInfo to the step body since 1.51, on older versions it's undefined.
 */
export function createStepSkip(stepInfo?: PwTestStepInfo): StepSkip {
  return (condition = true, description?: string) => {
    if (condition) skipStep(stepInfo, description);
  };
}

/**
 * $step.skip() when no step is running: in scenario hooks, fixtures or after the step has finished.
 * Without it, Playwright would try to skip a step that has already finished.
 */
export const skipOutsideOfStep: StepSkip = () => {
  throw new Error(`$step.skip() can only be called inside a step or a step hook.`);
};

export function isStepSkipError(error: unknown) {
  return stepSkipErrors.has(error as object);
}

function skipStep(stepInfo: PwTestStepInfo | undefined, description?: string) {
  if (!stepInfo) throw new Error(`$step.skip() requires Playwright 1.51 or newer.`);
  try {
    stepInfo.skip(true, description);
  } catch (e) {
    stepSkipErrors.add(e);
    throw e;
  }
}
