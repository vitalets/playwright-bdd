import { IRunConfiguration, IRunEnvironment, loadSupport } from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { exitWithMessage } from '../utils';

let supportCodeLibrary: Promise<ISupportCodeLibrary>;

export async function loadSteps(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  return supportCodeLibrary || (supportCodeLibrary = loadSupport(runConfiguration, environment));
}

export function findStepDefinition({ stepDefinitions }: ISupportCodeLibrary, stepText: string) {
  const matchedSteps = stepDefinitions.filter((step) => {
    return step.matchesStepName(stepText);
  });
  if (!matchedSteps.length) exitWithMessage(`Unknown step: ${stepText}`);
  if (matchedSteps.length > 1)
    exitWithMessage(
      [
        `Several steps found for text: ${stepText}`,
        ...matchedSteps.map((s) => `- ${s.pattern}`),
      ].join('\n'),
    );
  // todo: check stepDefinition.keyword with PickleStepType
  return matchedSteps[0];
}
