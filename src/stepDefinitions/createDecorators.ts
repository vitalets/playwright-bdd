/**
 * Define steps via decorators.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import { TestType } from '@playwright/test';
import { BuiltInFixtures } from '../playwright/types';
import { BDDFixtures } from '../run/baseTest';
import { StepConfig, buildCucumberStepFn } from './defineStep';
import {
  DefineStepPattern,
  ISupportCodeLibrary,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { buildStepDefinition } from '../cucumber/buildStepDefinition';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';

type CustomFixturesNames<T> = T extends TestType<infer U, infer W>
  ? Exclude<keyof U | keyof W, keyof (BuiltInFixtures & BDDFixtures) | symbol | number>
  : Exclude<keyof T, symbol | number>;

type DecoratedMethod = Function & { [decoratedStepSymbol]: StepConfig };

const decoratedStepSymbol = Symbol('decoratedStep');
const decoratedSteps = new Set<StepConfig>();

export function Fixture<T>(fixtureName: CustomFixturesNames<T>) {
  // context parameter is required for decorator by TS even though it's not used
  return (Ctor: any, _context: any) => {
    // iterate inheritance chain and update all parent's decorated steps
    // with possible fixtures
    while (Ctor?.prototype) {
      Object.getOwnPropertyNames(Ctor.prototype).forEach((methodName) => {
        const decoratedStep = (Ctor.prototype[methodName] as DecoratedMethod)[decoratedStepSymbol];
        if (decoratedStep) {
          decoratedStep.possibleFixtureNames.push(fixtureName);
          decoratedSteps.add(decoratedStep);
        }
      });
      Ctor = Object.getPrototypeOf(Ctor);
    }
  };
}

export function createStepDecorator(keyword: GherkinStepKeyword) {
  return (pattern: DefineStepPattern) => {
    // context parameter is required for decorator by TS even though it's not used
    return (method: Function, _context: any) => {
      (method as DecoratedMethod)[decoratedStepSymbol] = {
        keyword,
        pattern,
        fn: method,
        possibleFixtureNames: [],
        hasCustomTest: true,
        isDecorator: true,
      };
    };
  };
}

export function appendDecoratorSteps(supportCodeLibrary: ISupportCodeLibrary) {
  decoratedSteps.forEach((stepConfig) => {
    const { keyword, pattern, fn } = stepConfig;
    stepConfig.fn = (fixturesArg: Record<string, unknown>, ...args: any[]) => {
      const fixture = getSuitableFixture(fixturesArg, stepConfig);
      return fn.call(fixture, ...args);
    };
    const code = buildCucumberStepFn(stepConfig);
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

function getSuitableFixture(fixturesArg: Record<string, unknown>, stepConfig: StepConfig) {
  // there should be exatcly one fixture in fixturesArg from possibleFixtures
  const fixtureNames = stepConfig.possibleFixtureNames.filter(
    (fixtureName) => fixturesArg[fixtureName],
  );

  if (fixtureNames.length === 0) {
    throw new Error(`No suitable fixtures found for decorator step ${stepConfig.pattern}`);
  }

  if (fixtureNames.length > 1) {
    throw new Error(`Several suitable fixtures found for decorator step ${stepConfig.pattern}`);
  }

  return fixturesArg[fixtureNames[0]];
}

export function filterFixtureNamesByTags(fixtureNames: string[], tags: string[]) {
  return fixtureNames.filter((fixtureName) => {
    return tags.includes(`@fixture:${fixtureName}`);
  });
}
