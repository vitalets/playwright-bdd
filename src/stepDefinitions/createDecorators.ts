/**
 * Define steps via decorators.
 */

/* eslint-disable @typescript-eslint/ban-types */

import { TestType } from '@playwright/test';
import { BuiltInFixtures } from '../playwright/types';
import { BDDFixtures } from '../run/baseTest';
import { PomNode, StepConfig, buildCucumberStepFn } from './defineStep';
import {
  DefineStepPattern,
  ISupportCodeLibrary,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { buildStepDefinition } from '../cucumber/buildStepDefinition';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { isBddAutoFixture } from './createBdd';

type CustomFixturesNames<T> = T extends TestType<infer U, infer W>
  ? Exclude<keyof U | keyof W, keyof (BuiltInFixtures & BDDFixtures) | symbol | number>
  : Exclude<keyof T, symbol | number>;

type DecoratedMethod = Function & { [decoratedStepSymbol]: StepConfig };

const pomGraph = new Map<Function, PomNode>();

const decoratedStepSymbol = Symbol('decoratedStep');
const decoratedSteps = new Set<StepConfig>();

export function Fixture<T>(fixtureName: CustomFixturesNames<T>) {
  // context parameter is required for decorator by TS even though it's not used
  return (Ctor: Function, _context: ClassDecoratorContext) => {
    createPomNode(Ctor, fixtureName);
  };
}

export function createStepDecorator(keyword: GherkinStepKeyword) {
  return (pattern: DefineStepPattern) => {
    // context parameter is required for decorator by TS even though it's not used
    return (method: Function, _context: ClassMethodDecoratorContext) => {
      (method as DecoratedMethod)[decoratedStepSymbol] = {
        keyword,
        pattern,
        fn: method,
        hasCustomTest: true,
        isDecorator: true,
      };
    };
  };
}

export function appendDecoratorSteps(supportCodeLibrary: ISupportCodeLibrary) {
  decoratedSteps.forEach((stepConfig) => {
    const { keyword, pattern, fn } = stepConfig;
    stepConfig.fn = (fixturesArg: Record<string, unknown>, ...args: unknown[]) => {
      const fixture = getFirstNonAutoFixture(fixturesArg, stepConfig);
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
  decoratedSteps.clear();
  // todo: fill supportCodeLibrary.originalCoordinates as it is used in snippets?
}

export function getPomNodeByFixtureName(fixtureName: string) {
  for (const pomNode of pomGraph.values()) {
    if (pomNode.fixtureName === fixtureName) return pomNode;
  }
}

function createPomNode(Ctor: Function, fixtureName: string) {
  const pomNode: PomNode = {
    fixtureName,
    children: new Set(),
  };
  pomGraph.set(Ctor, pomNode);
  getDecoratedSteps(Ctor).forEach((stepConfig) => {
    stepConfig.pomNode = pomNode;
    decoratedSteps.add(stepConfig);
  });
  const parentCtor = Object.getPrototypeOf(Ctor);
  if (!parentCtor) return;
  const parentPomNode = pomGraph.get(parentCtor) || createPomNode(parentCtor, '');
  parentPomNode?.children.add(pomNode);
  return pomNode;
}

function getDecoratedSteps(Ctor: Function) {
  if (!Ctor?.prototype) return [];
  return Object.getOwnPropertyNames(Ctor.prototype)
    .map((methodName) => {
      return (Ctor.prototype[methodName] as DecoratedMethod)[decoratedStepSymbol];
    })
    .filter(Boolean);
}

function getFirstNonAutoFixture(fixturesArg: Record<string, unknown>, stepConfig: StepConfig) {
  // there should be exatcly one suitable fixture in fixturesArg
  const fixtureNames = Object.keys(fixturesArg).filter(
    (fixtureName) => !isBddAutoFixture(fixtureName),
  );

  if (fixtureNames.length === 0) {
    throw new Error(`No suitable fixtures found for decorator step "${stepConfig.pattern}"`);
  }

  if (fixtureNames.length > 1) {
    throw new Error(`Several suitable fixtures found for decorator step "${stepConfig.pattern}"`);
  }

  return fixturesArg[fixtureNames[0]];
}
