import { IRunConfiguration, IRunEnvironment, loadSupport } from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { installTransform } from '../playwright/transform';
import { exit } from '../utils/exit';

const cache = new Map<string, Promise<ISupportCodeLibrary>>();

export async function loadSteps(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  const cacheKey = JSON.stringify(runConfiguration);
  let lib = cache.get(cacheKey);

  if (!lib) {
    // use Playwright's built-in hook to compile TypeScript steps
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const uninstall = !hasTsNodeRegister(runConfiguration) ? installTransform() : () => {};
    lib = loadSupport(runConfiguration, environment).finally(() => uninstall());
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
    exit(
      [
        `Several step definitions found for text: ${stepText} (${file})`,
        ...matchedSteps.map((s) => `- ${s.pattern}`),
      ].join('\n'),
    );
  // todo: check stepDefinition.keyword with PickleStepType
  return matchedSteps[0];
}

export function hasTsNodeRegister(runConfiguration: IRunConfiguration) {
  return runConfiguration.support.requireModules.includes('ts-node/register');
}
