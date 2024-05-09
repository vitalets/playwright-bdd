/**
 * New cucumber-style steps where Given/When/Then are not imported from @cucumber/cucumber.
 * Instead they are imported as:
 * const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
 *
 * Internally they are explicitly added to supportCodeLibrary.stepDefinitions
 * in the same way as decorator steps. But step fn is bound to the world fixture,
 * no matter what world is provided by Cucumber.
 *
 * The goal of this is to allow usage of cucumber-style without explicitly importing
 * Give/When/Then from cucumber.
 */
import { ISupportCodeLibrary } from '../../cucumber/types';
import { CucumberStepFunction, StepConfig } from '../stepConfig';
import { buildStepDefinition } from '../../cucumber/buildStepDefinition';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { getLocationByOffset } from '../../playwright/getLocationInFile';

const stepConfigs: StepConfig[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CucumberStyleStepFn<World> = (this: World, ...args: any[]) => unknown;

export function cucumberStepCtor<StepFn extends StepConfig['fn']>(
  keyword: GherkinStepKeyword,
  worldFixture: string,
) {
  return (pattern: DefineStepPattern, fn: StepFn) => {
    stepConfigs.push({
      keyword,
      pattern,
      fn,
      hasCustomTest: true,
      location: getLocationByOffset(3),
      worldFixture,
    });
    // returns function to be able to call this step from other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    // Note: for new cucumber style we should call this fn with current world (add to docs)
    return fn;
  };
}

/**
 * Append steps to Cucumber's supportCodeLibrary.
 */
export function appendNewCucumberStyleSteps(supportCodeLibrary: ISupportCodeLibrary) {
  stepConfigs.forEach((stepConfig) => {
    const { keyword, pattern } = stepConfig;
    const code = buildCucumberStepFnWithNewStyleWorld(stepConfig);
    const { file: uri, line } = stepConfig.location;
    const stepDefinition = buildStepDefinition(
      {
        keyword,
        pattern,
        code,
        uri,
        line,
        options: {}, // not used in playwright-bdd
      },
      supportCodeLibrary,
    );
    supportCodeLibrary.stepDefinitions.push(stepDefinition);
  });
  stepConfigs.length = 0;
}

function buildCucumberStepFnWithNewStyleWorld(stepConfig: StepConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code: CucumberStepFunction = function (...args: any[]) {
    const world = this.$internal.newCucumberStyleWorld;
    return stepConfig.fn.call(world, ...args);
  };

  // attach stepConfig to fn for easier access later
  code.stepConfig = stepConfig;

  return code;
}
