import { IRunConfiguration, IRunEnvironment, loadSupport } from '@cucumber/cucumber/api';
import { installTransform } from '../playwright/transform';
import { ISupportCodeLibrary } from './types';

const cache = new Map<string, Promise<ISupportCodeLibrary>>();

export async function loadSteps(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  const cacheKey = JSON.stringify(runConfiguration);
  let lib = cache.get(cacheKey);

  if (!lib) {
    // use Playwright's built-in hook to compile TypeScript steps
    const uninstall = !hasTsNodeRegister(runConfiguration) ? installTransform() : () => {};
    lib = loadSupport(runConfiguration, environment).finally(
      () => uninstall(),
      // we use unknown here b/c Cucumber hides internal props from public type
    ) as unknown as Promise<ISupportCodeLibrary>;
    cache.set(cacheKey, lib);
  }

  return lib;
}

export function hasTsNodeRegister(runConfiguration: IRunConfiguration) {
  return runConfiguration.support.requireModules?.includes('ts-node/register');
}
