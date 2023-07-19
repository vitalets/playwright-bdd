/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

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

export type DefineStepOptions = {
  keyword: GherkinStepKeyword;
  pattern: DefineStepPattern;
  fn: Function;
  hasCustomTest: boolean;
};

// extend Cucumber step function with some properties
export type CucumberStepFunction = TestStepFunction<World> & {
  fn: Function;
  hasCustomTest: boolean;
  isDecorator: boolean;
};

export function defineStep({ keyword, pattern, fn, hasCustomTest }: DefineStepOptions) {
  const cucumberDefineStepFn = getCucumberDefineStepFn(keyword);
  const code = getCucumberStepFn(fn, { hasCustomTest });
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

export function getCucumberStepFn(fn: Function, { hasCustomTest = false, isDecorator = false }) {
  const code: CucumberStepFunction = function (...args: any[]) {
    const fixturesArg = Object.assign({}, this.customFixtures, {
      $testInfo: this.testInfo,
      $test: this.test,
      $tags: this.tags,
    });
    return fn.call(this, fixturesArg, ...args);
  };

  // store original fn to be able to extract fixture names
  code.fn = fn;
  code.hasCustomTest = hasCustomTest;
  code.isDecorator = isDecorator;

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
