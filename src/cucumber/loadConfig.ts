import {
  ILoadConfigurationOptions,
  IResolvedConfiguration,
  IRunEnvironment,
  loadConfiguration,
} from '@cucumber/cucumber/api';

const cache = new Map<string, Promise<IResolvedConfiguration>>();

export async function loadConfig(
  options?: ILoadConfigurationOptions,
  environment?: IRunEnvironment,
) {
  const cacheKey = JSON.stringify(options);
  let config = cache.get(cacheKey);
  if (!config) {
    config = loadConfiguration(options, environment);
    cache.set(cacheKey, config);
  }

  return config;
}
