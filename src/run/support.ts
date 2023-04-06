import {
  IRunConfiguration,
  loadConfiguration,
  loadSupport,
} from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { World as CucumberWorld } from '@cucumber/cucumber';
import { World } from './world';

export type LoadedCucumber = {
  runConfiguration: IRunConfiguration;
  supportCodeLibrary: ISupportCodeLibrary;
};

let loadedCucumber: LoadedCucumber;

export async function loadCucumber() {
  if (!loadedCucumber) {
    const { runConfiguration } = await loadConfiguration();
    const supportCodeLibrary = await loadSupport(runConfiguration);
    loadedCucumber = { runConfiguration, supportCodeLibrary };
  }
  return loadedCucumber;
}

export function getWorldConstructor(supportCodeLibrary: ISupportCodeLibrary) {
  // setWorldConstructor was not called
  if (supportCodeLibrary.World === CucumberWorld) {
    return World;
  }
  if (!Object.prototype.isPrototypeOf.call(World, supportCodeLibrary.World)) {
    throw new Error(`CustomWorld should inherit from playwright-bdd World`);
  }
  return supportCodeLibrary.World as typeof World;
}
