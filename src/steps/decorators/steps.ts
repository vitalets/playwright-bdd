/**
 * Define steps via decorators.
 */

/* eslint-disable @typescript-eslint/ban-types */

import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { buildStepDefinition } from '../../cucumber/buildStepDefinition';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { StepConfig } from '../stepConfig';
import { buildCucumberStepFn } from '../playwrightStyle/defineStep';
import { PomNode } from './pomGraph';
import { ISupportCodeLibrary } from '../../cucumber/types';
import { isBddAutoInjectFixture } from '../../run/bddFixtures/autoInject';
import { getLocationByOffset } from '../../playwright/getLocationInFile';

// initially we sotre step data inside method,
// and then extract it in @Fixture decorator call
const decoratedStepSymbol = Symbol('decoratedStep');
type DecoratedMethod = Function & { [decoratedStepSymbol]: StepConfig };

// global list of all decorator steps
const decoratedSteps = new Set<StepConfig>();

/**
 * Creates @Given, @When, @Then decorators.
 */
export function createStepDecorator(keyword: GherkinStepKeyword) {
  return (pattern: DefineStepPattern) => {
    // offset = 3 b/c this call is 3 steps below the user's code
    const location = getLocationByOffset(3);
    // context parameter is required for decorator by TS even though it's not used
    return (method: StepConfig['fn'], _context: ClassMethodDecoratorContext) => {
      saveStepConfigToMethod(method, {
        keyword,
        pattern,
        location,
        fn: method,
        hasCustomTest: true,
      });
    };
  };
}

export function linkStepsWithPomNode(Ctor: Function, pomNode: PomNode) {
  if (!Ctor?.prototype) return;
  const propertyDescriptors = Object.getOwnPropertyDescriptors(Ctor.prototype);
  return Object.values(propertyDescriptors).forEach((descriptor) => {
    const stepConfig = getStepConfigFromMethod(descriptor);
    if (!stepConfig) return;
    stepConfig.pomNode = pomNode;
    decoratedSteps.add(stepConfig);
  });
}

/**
 * Append decorator steps to Cucumber's supportCodeLibrary.
 */
export function appendDecoratorSteps(supportCodeLibrary: ISupportCodeLibrary) {
  decoratedSteps.forEach((stepConfig) => {
    const { keyword, pattern, fn } = stepConfig;
    stepConfig.fn = (fixturesArg: Record<string, unknown>, ...args: unknown[]) => {
      const fixture = getFirstNonAutoInjectFixture(fixturesArg, stepConfig);
      return fn.call(fixture, ...args);
    };
    const code = buildCucumberStepFn(stepConfig);
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
  decoratedSteps.clear();
  // todo: fill supportCodeLibrary.originalCoordinates as it is used in snippets?
}

function getFirstNonAutoInjectFixture(
  fixturesArg: Record<string, unknown>,
  stepConfig: StepConfig,
) {
  // there should be exatcly one suitable fixture in fixturesArg
  const fixtureNames = Object.keys(fixturesArg).filter(
    (fixtureName) => !isBddAutoInjectFixture(fixtureName),
  );

  if (fixtureNames.length === 0) {
    throw new Error(`No suitable fixtures found for decorator step "${stepConfig.pattern}"`);
  }

  if (fixtureNames.length > 1) {
    throw new Error(`Several suitable fixtures found for decorator step "${stepConfig.pattern}"`);
  }

  return fixturesArg[fixtureNames[0]];
}

function saveStepConfigToMethod(method: StepConfig['fn'], stepConfig: StepConfig) {
  (method as unknown as DecoratedMethod)[decoratedStepSymbol] = stepConfig;
}

function getStepConfigFromMethod(descriptor: PropertyDescriptor) {
  // filter out getters / setters
  return typeof descriptor.value === 'function'
    ? (descriptor.value as DecoratedMethod)[decoratedStepSymbol]
    : undefined;
}
