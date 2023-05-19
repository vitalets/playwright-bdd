import { IRunConfiguration, IRunEnvironment, loadSupport } from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';

let supportCodeLibrary: Promise<ISupportCodeLibrary>;

export async function loadSteps(runConfiguration: IRunConfiguration, environment: IRunEnvironment = {}) {
  return supportCodeLibrary || (supportCodeLibrary = loadSupport(runConfiguration, environment));
}

export function findStepDefinition({ stepDefinitions }: ISupportCodeLibrary, stepText: string) {
  const matchedSteps = stepDefinitions.filter((step) => {
    return step.matchesStepName(stepText);
  });
  if (!matchedSteps.length) throw new Error(`Unknown step: ${stepText}`);
  if (matchedSteps.length > 1)
    throw new Error(
      [`Several steps found for text: ${stepText}`, ...matchedSteps.map((s) => `- ${s.pattern}`)].join('\n'),
    );
  // todo: check stepDefinition.keyword with PickleStepType
  return matchedSteps[0];
}
