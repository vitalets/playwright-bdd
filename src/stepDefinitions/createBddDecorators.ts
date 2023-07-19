/**
 * Define steps via decorators.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import { TestType } from '@playwright/test';
import { BuiltInFixtures } from '../playwright/types';
import { BDDFixtures } from '../run/baseTest';
import { DefineStepOptions, getCucumberStepFn } from './defineStep';
import { forceSetFixtureParameterNames } from '../playwright/fixtureParameterNames';
import {
  DefineStepPattern,
  ISupportCodeLibrary,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { buildStepDefinition } from '../cucumber/buildStepDefinition';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';

type CustomFixturesNames<T> = T extends TestType<infer U, infer W>
  ? Exclude<keyof U | keyof W, keyof (BuiltInFixtures & BDDFixtures)>
  : keyof T;

const steps: DefineStepOptions[] = [];

export function createBddDecorators<T>(fixtureName: CustomFixturesNames<T>) {
  const fixtureNameStr = String(fixtureName);
  return {
    Given: createDecorator('Given', fixtureNameStr),
    When: createDecorator('When', fixtureNameStr),
    Then: createDecorator('Then', fixtureNameStr),
    Step: createDecorator('Unknown', fixtureNameStr),
  };
}

function createDecorator(keyword: GherkinStepKeyword, fixtureName: string) {
  return (pattern: DefineStepPattern) => {
    return (_: Function, context: ClassMethodDecoratorContext) => {
      const fn = (fixturesArg: any, ...args: any[]) => {
        return fixturesArg[fixtureName][context.name](...args);
      };

      // decorator steps always depend only on POM fixture
      forceSetFixtureParameterNames(fn, [fixtureName]);

      steps.push({
        keyword,
        pattern,
        hasCustomTest: true,
        fn,
      });
    };
  };
}

export function appendDecoratorSteps(supportCodeLibrary: ISupportCodeLibrary) {
  steps.forEach(({ keyword, pattern, fn }) => {
    const code = getCucumberStepFn(fn, { hasCustomTest: true, isDecorator: true });
    const stepDefinition = buildStepDefinition(
      {
        keyword,
        pattern,
        code,
        line: 0, // not used in playwright-bdd
        options: {}, // not used in playwright-bdd
        uri: '', // not used in playwright-bdd
      },
      supportCodeLibrary,
    );
    supportCodeLibrary.stepDefinitions.push(stepDefinition);
  });
  // todo: fill supportCodeLibrary.originalCoordinates as it is used in snippets?
}
