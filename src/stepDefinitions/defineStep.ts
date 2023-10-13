import {
  Given as CucumberGiven,
  When as CucumberWhen,
  Then as CucumberThen,
  defineStep as CucumberDefineStep,
} from '@cucumber/cucumber';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { CucumberStepFunction, StepConfig } from './stepConfig';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { exit } from '../utils/exit';

/**
 * Defines step by config.
 * Calls cucumber's Given(), When(), Then() under the hood.
 */
export function defineStep(stepConfig: StepConfig) {
  const { keyword, pattern } = stepConfig;
  const cucumberDefineStepFn = getCucumberDefineStepFn(keyword);
  const code = buildCucumberStepCode(stepConfig);
  try {
    cucumberDefineStepFn(pattern, code);
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

export function buildCucumberStepCode(stepConfig: StepConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code: CucumberStepFunction = function (...args: any[]) {
    const fixturesArg = Object.assign({}, this.customFixtures, {
      $testInfo: this.testInfo,
      $test: this.test,
      $tags: this.tags,
    });

    return stepConfig.fn.call(this, fixturesArg, ...args);
  };

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
