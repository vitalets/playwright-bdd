import { loadConfiguration, loadSupport } from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { PickleStep } from '@cucumber/messages';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { World } from './world';

let supportCodeLibraryPromise: Promise<ISupportCodeLibrary>;
export async function getSupportCodeLibrary() {
  if (!supportCodeLibraryPromise) {
    supportCodeLibraryPromise = loadConfiguration(undefined, {
      debug: false,
    }).then(({ runConfiguration }) => {
      return loadSupport(runConfiguration);
    });
  }
  return supportCodeLibraryPromise;
}

export async function invokeStep(world: World, stepText: string) {
  const stepDefinition = await findStepDefinition(stepText);
  const { parameters } = await stepDefinition.getInvocationParameters({
    hookParameter: {} as ITestCaseHookParameter,
    step: { text: stepText } as PickleStep,
    world,
  });
  await stepDefinition.code.apply(world, parameters);
}

async function findStepDefinition(stepText: string) {
  const support = await getSupportCodeLibrary();
  const stepDefinitions = support.stepDefinitions.filter((step) => {
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
