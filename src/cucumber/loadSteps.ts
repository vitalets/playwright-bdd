import { IRunConfiguration, IRunEnvironment, loadSupport } from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { exitWithMessage } from '../utils';

const cache = new Map<string, Promise<ISupportCodeLibrary>>();

export async function loadSteps(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  const cacheKey = JSON.stringify(runConfiguration);
  let lib = cache.get(cacheKey);

  if (!lib) {
    lib = loadSupport(runConfiguration, environment);
    cache.set(cacheKey, lib);
  }

  return lib;
}

export function findStepDefinition(
  supportCodeLibrary: ISupportCodeLibrary,
  stepText: string,
  file: string,
) {
  const matchedSteps = supportCodeLibrary.stepDefinitions.filter((step) => {
    return step.matchesStepName(stepText);
  });
  if (matchedSteps.length === 0) return;
  if (matchedSteps.length > 1)
    exitWithMessage(
      [
        `Several step definitions found for text: ${stepText} (${file})`,
        ...matchedSteps.map((s) => `- ${s.pattern}`),
      ].join('\n'),
    );
  // todo: check stepDefinition.keyword with PickleStepType
  return matchedSteps[0];
}
