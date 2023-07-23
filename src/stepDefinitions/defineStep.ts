import {
  Given as CucumberGiven,
  When as CucumberWhen,
  Then as CucumberThen,
  defineStep as CucumberDefineStep,
} from '@cucumber/cucumber';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import {
  DefineStepPattern,
  TestStepFunction,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { World } from '../run/world';
import { exitWithMessage } from '../utils';

// Page Object Node is used in decorator steps dependency graph
export type PomNode = {
  fixtureName: string;
  children: Set<PomNode>;
};

export type StepConfig = {
  keyword: GherkinStepKeyword;
  pattern: DefineStepPattern;
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function;
  hasCustomTest: boolean;
  isDecorator: boolean;
  pomNode?: PomNode;
};

// attach stepConfig to Cucumber step function
// to keep type of StepDefinition itself unchanged
export type CucumberStepFunction = TestStepFunction<World> & {
  stepConfig?: StepConfig;
};

export function defineStep(stepConfig: StepConfig) {
  const { keyword, pattern } = stepConfig;
  const cucumberDefineStepFn = getCucumberDefineStepFn(keyword);
  const code = buildCucumberStepFn(stepConfig);
  try {
    cucumberDefineStepFn(pattern, code);
  } catch (e) {
    // todo: detect that this is import from test file
    // and skip/delay registering cucumber steps until cucumber is loaded
    const isMissingCucumber = /Cucumber that isn't running/i.test(e.message);
    if (isMissingCucumber) {
      exitWithMessage(
        `Option "importTestFrom" should point to separate file without step definitions`,
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
