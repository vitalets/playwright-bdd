/**
 * Handles Fix With AI feature for Cucumber HTML Reporter.
 */
import { TestCaseRun } from '../../messagesBuilder/TestCaseRun';
import { extractAriaSnapshot } from '../../../../ai/ariaSnapshot';
import { stripAnsiEscapes } from '../../../../utils/stripAnsiEscapes';

import { promptTemplate } from './prompt.template';

export function buildPrompt(testCaseRun: TestCaseRun) {
  const scenarioName = testCaseRun.test.title;
  const executedSteps = testCaseRun.executedBddSteps
    .map(({ pwStep }) => pwStep?.title)
    .filter(Boolean)
    .join('\n');

  const errorMessage = stripAnsiEscapes(testCaseRun.result.error?.message || '');
  const snippet = stripAnsiEscapes(testCaseRun.result.error?.snippet || '');
  const ariaSnapshot = extractAriaSnapshot(testCaseRun.test);

  if (!ariaSnapshot || !errorMessage) return;

  return promptTemplate
    .replace('{scenarioName}', scenarioName)
    .replace('{steps}', executedSteps)
    .replace('{error}', errorMessage)
    .replace('{snippet}', snippet)
    .replace('{ariaSnapshot}', ariaSnapshot)
    .trim();
}
