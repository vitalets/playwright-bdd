import { Step, PickleStep } from '@cucumber/messages';

export function getStepTextWithKeyword(scenarioStep: Step | undefined, pickleStep: PickleStep) {
  // fallback to empty keyword if scenario step is not provided
  const keyword = scenarioStep?.keyword || '';
  // There is no full original step text in gherkin document.
  // Build it by concatenation of keyword and pickle text.
  // Cucumber html-formatter does the same:
  // https://github.com/cucumber/react-components/blob/27b02543a5d7abeded3410a58588ee4b493b4a8f/src/components/gherkin/GherkinStep.tsx#L114
  return `${keyword}${pickleStep.text}`;
}
