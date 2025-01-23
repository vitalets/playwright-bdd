import { PickleTag, Tag, Scenario } from '@cucumber/messages';

export function getStepTextWithKeyword(keyword: string | undefined, pickleStepText: string) {
  // There is no full original step text in gherkin document.
  // Build it by concatenation of keyword and pickle text.
  // Cucumber html-formatter does the same:
  // https://github.com/cucumber/react-components/blob/27b02543a5d7abeded3410a58588ee4b493b4a8f/src/components/gherkin/GherkinStep.tsx#L114
  return `${keyword || ''}${pickleStepText}`;
}

export function getTagNames(tags?: readonly Tag[] | readonly PickleTag[]) {
  return tags?.map((tag) => tag.name) || [];
}

export function isScenarioOutline(scenario: Scenario) {
  // scenario outline without 'Examples:' block behaves like a usual scenario
  return Boolean(scenario.examples?.length);
}
