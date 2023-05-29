import { ILoadConfigurationOptions, IRunEnvironment, loadConfiguration } from '@cucumber/cucumber/api';

let config: ReturnType<typeof loadConfiguration>;

export async function loadConfig(options?: ILoadConfigurationOptions, environment?: IRunEnvironment) {
  return config || (config = loadConfiguration(options, environment));
}
