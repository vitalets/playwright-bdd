/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/pickle_parser.ts
 */
import * as messages from '@cucumber/messages';

interface IGetStepKeywordRequest {
  pickleStep: messages.PickleStep;
  gherkinStepMap: Record<string, messages.Step>;
}

interface IGetScenarioDescriptionRequest {
  pickle: messages.Pickle;
  gherkinScenarioMap: Record<string, messages.Scenario>;
}

export function getScenarioDescription({
  pickle,
  gherkinScenarioMap,
}: IGetScenarioDescriptionRequest): string {
  return pickle.astNodeIds.map((id) => gherkinScenarioMap[id]).filter((x) => x != null)[0]
    .description;
}

export function getStepKeyword({ pickleStep, gherkinStepMap }: IGetStepKeywordRequest): string {
  return pickleStep.astNodeIds.map((id) => gherkinStepMap[id]).filter((x) => x != null)[0].keyword;
}

export function getPickleStepMap(pickle: messages.Pickle): Record<string, messages.PickleStep> {
  const result: Record<string, messages.PickleStep> = {};
  pickle.steps.forEach((pickleStep) => (result[pickleStep.id] = pickleStep));
  return result;
}
