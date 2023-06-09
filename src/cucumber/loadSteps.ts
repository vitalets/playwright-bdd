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
    lib = loadSupport(runConfiguration, environment).then((lib) => {
      assertStepsLoaded(lib);
      return lib;
    });
    cache.set(cacheKey, lib);
  }

  return lib;
}

export function findStepDefinition(
  { stepDefinitions }: ISupportCodeLibrary,
  stepText: string,
  file: string,
) {
  const matchedSteps = stepDefinitions.filter((step) => {
    return step.matchesStepName(stepText);
  });
  if (matchedSteps.length === 0) {
    exitWithMessage(`Undefined step: ${stepText} (${file})`);
  }
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

function assertStepsLoaded(lib: ISupportCodeLibrary) {
  if (lib.stepDefinitions.length === 0) {
    const { requirePaths, importPaths } = lib.originalCoordinates;
    const total = requirePaths.length + importPaths.length;
    exitWithMessage(
      [
        `No step definitions loaded. Scanned files (${total}):`,
        ...requirePaths,
        ...importPaths,
      ].join('\n'),
    );
  }
}
