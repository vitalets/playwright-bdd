import {
  IRunConfiguration,
  loadConfiguration,
  loadSupport,
} from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { PickleStep } from '@cucumber/messages';
import {
  ITestCaseHookParameter,
  World as CucumberWorld,
} from '@cucumber/cucumber';
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

export async function invokeStep(
  world: World,
  text: string,
  argument?: unknown
) {
  const stepDefinition = await findStepDefinition(text);
  const { parameters } = await stepDefinition.getInvocationParameters({
    hookParameter: {} as ITestCaseHookParameter,
    step: { text, argument } as PickleStep,
    world,
  });
  return stepDefinition.code.apply(world, parameters);
}

async function findStepDefinition(stepText: string) {
  const { supportCodeLibrary } = await loadCucumber();
  const stepDefinitions = supportCodeLibrary.stepDefinitions.filter((step) => {
    return step.matchesStepName(stepText);
  });
  if (!stepDefinitions.length) throw new Error(`Unknown step: ${stepText}`);
  if (stepDefinitions.length > 1)
    throw new Error(
      [
        `Several steps found for text: ${stepText}`,
        ...stepDefinitions.map((s) => `- ${s.pattern}`),
      ].join('\n')
    );
  // todo: check stepDefinition.keyword with PickleStepType
  return stepDefinitions[0];
}
