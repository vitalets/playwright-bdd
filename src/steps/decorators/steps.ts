/**
 * Define steps via decorators.
 */

/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { StepConfig } from '../stepConfig';
import { PomNode } from './pomGraph';
import { isBddAutoInjectFixture } from '../../run/bddFixtures/autoInject';
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { DefineStepPattern, GherkinStepKeyword, registerStepDefinition } from '../registry';

// initially we store step data inside method,
// and then extract it in @Fixture decorator call
const decoratedStepSymbol = Symbol('decoratedStep');
type DecoratedMethod = Function & { [decoratedStepSymbol]: StepConfig };

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
        // hasCustomTest: true,
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
    registerDecoratorStep(stepConfig);
  });
}

// todo: link decorator steps with customTest!

function registerDecoratorStep(stepConfig: StepConfig) {
  const { fn } = stepConfig;

  stepConfig.fn = (fixturesArg: Record<string, unknown>, ...args: unknown[]) => {
    const fixture = getFirstNonAutoInjectFixture(fixturesArg, stepConfig);
    return fn.call(fixture, ...args);
  };

  registerStepDefinition(stepConfig);
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
