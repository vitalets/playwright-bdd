import {
  Given as CucumberGiven,
  When as CucumberWhen,
  Then as CucumberThen,
  defineStep as CucumberDefineStep,
} from '@cucumber/cucumber';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { CucumberStepFunction, StepConfig } from '../stepConfig';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { exit } from '../../utils/exit';
import { getBddAutoInjectFixtures } from '../../run/bddFixtures/autoInject';

/**
 * Defines step by config.
 * Calls cucumber's Given(), When(), Then() under the hood.
 */
export function defineStep(stepConfig: StepConfig) {
  const { keyword, pattern } = stepConfig;
  const cucumberDefineStep = getCucumberDefineStepFn(keyword);
  const code = buildCucumberStepFn(stepConfig);
  try {
    cucumberDefineStep(pattern, code);
  } catch (e) {
    // todo: detect that this is import from test file
    // and skip/delay registering cucumber steps until cucumber is loaded
    const isMissingCucumber = /Cucumber that isn't running/i.test(e.message);
    if (isMissingCucumber) {
      exit(
        `Option "importTestFrom" should point to a separate file without step definitions`,
        `(e.g. without calls of Given, When, Then)`,
      );
    } else {
      throw e;
    }
  }
}

export function buildCucumberStepFn(stepConfig: StepConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code: CucumberStepFunction = function (...args: any[]) {
    // build the first argument (fixtures) for step fn
    const fixturesArg = Object.assign(
      {},
      this.$internal.currentStepFixtures,
      getBddAutoInjectFixtures(this),
    );
    return stepConfig.fn.call(this, fixturesArg, ...args);
  };

  // attach stepConfig to fn for easier access later
  code.stepConfig = stepConfig;

  return code;
}

export function getStepCode(stepDefinition: StepDefinition) {
  return stepDefinition.code as CucumberStepFunction;
}

function getCucumberDefineStepFn(keyword: GherkinStepKeyword) {
  switch (keyword) {
    case 'Given':
      return CucumberGiven;
    case 'When':
      return CucumberWhen;
    case 'Then':
      return CucumberThen;
    default:
      return CucumberDefineStep;
  }
}
