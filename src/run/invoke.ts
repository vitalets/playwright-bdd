import { PickleStep } from '@cucumber/messages';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { World } from './world';
import { loadCucumber } from './support';

export async function invokeStep(
  world: World,
  text: string,
  argument?: unknown,
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
      ].join('\n'),
    );
  // todo: check stepDefinition.keyword with PickleStepType
  return stepDefinitions[0];
}
