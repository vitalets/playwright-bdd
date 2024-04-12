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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const uninstall = !hasTsNodeRegister(runConfiguration) ? installTransform() : () => {};
    lib = loadSupport(runConfiguration, environment).finally(() =>
      uninstall(),
    ) as Promise<ISupportCodeLibrary>;
    cache.set(cacheKey, lib);
  }

  return lib;
}

export function hasTsNodeRegister(runConfiguration: IRunConfiguration) {
  return runConfiguration.support.requireModules.includes('ts-node/register');
}
