/**
 * Handles Fix With AI feature for Cucumber HTML Reporter.
 */
import { TestCaseRun } from '../../messagesBuilder/TestCaseRun';
import { extractAriaSnapshot } from '../../../../ai/ariaSnapshot';
import { stripAnsiEscapes } from '../../../../utils/stripAnsiEscapes';
import { defaultPromptTemplate } from './prompt.template';
import { substitute } from '../../../../utils';

// eslint-disable-next-line visual/complexity
export function buildPrompt(testCaseRun: TestCaseRun, customPrompt?: string) {
  const scenarioName = testCaseRun.test.title;
  const steps = buildStepsList(testCaseRun);
  const error = stripAnsiEscapes(testCaseRun.result.error?.message || '');
  const snippet = stripAnsiEscapes(testCaseRun.result.error?.snippet || '');
  const ariaSnapshot = extractAriaSnapshot(testCaseRun.test);

  if (!ariaSnapshot || !error) return;

  return substitute(customPrompt || defaultPromptTemplate, {
    scenarioName,
    steps,
    error,
    snippet,
    ariaSnapshot,
  }).trim();
}

function buildStepsList(testCaseRun: TestCaseRun) {
  return testCaseRun.executedBddSteps
    .map(({ pwStep }) => pwStep?.title)
    .filter(Boolean)
    .join('\n');
}
