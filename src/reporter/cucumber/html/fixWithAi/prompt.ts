/**
 * Handles Fix With AI feature for Cucumber HTML Reporter.
 */
import { TestCaseRun } from '../../messagesBuilder/TestCaseRun';
import { extractAriaSnapshot } from '../../../../ai/ariaSnapshot';
import { stripAnsiEscapes } from '../../../../utils/stripAnsiEscapes';
import { defaultPromptTemplate } from './prompt.template';

// eslint-disable-next-line visual/complexity
export function buildPrompt(testCaseRun: TestCaseRun, customPrompt?: string) {
  const scenarioName = testCaseRun.test.title;
  const executedSteps = buildStepsList(testCaseRun);
  const errorMessage = stripAnsiEscapes(testCaseRun.result.error?.message || '');
  const snippet = stripAnsiEscapes(testCaseRun.result.error?.snippet || '');
  const ariaSnapshot = extractAriaSnapshot(testCaseRun.test);

  if (!ariaSnapshot || !errorMessage) return;

  return (customPrompt || defaultPromptTemplate)
    .replace('{scenarioName}', scenarioName)
    .replace('{steps}', executedSteps)
    .replace('{error}', errorMessage)
    .replace('{snippet}', snippet)
    .replace('{ariaSnapshot}', ariaSnapshot)
    .trim();
}

function buildStepsList(testCaseRun: TestCaseRun) {
  return testCaseRun.executedBddSteps
    .map(({ pwStep }) => pwStep?.title)
    .filter(Boolean)
    .join('\n');
}
