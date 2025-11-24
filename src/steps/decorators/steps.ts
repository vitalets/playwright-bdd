/**
 * Define steps via decorators.
 */

/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { PomNode } from './pomGraph';
import { isBddAutoInjectFixture } from '../../runtime/bddTestFixturesAuto';
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { registerStepDefinition } from '../stepRegistry';
import {
  StepPattern,
  GherkinStepKeyword,
  StepDefinitionOptions,
  ProvidedStepOptions,
} from '../stepDefinition';

// initially we store step data inside method,
// and then extract it in @Fixture decorator call
const decoratedStepSymbol = Symbol('decoratedStep');
type DecoratedMethod = Function & { [decoratedStepSymbol]: StepDefinitionOptions[] };

/**
 * Creates @Given, @When, @Then decorators.
 */
export function createStepDecorator(keyword: GherkinStepKeyword) {
  return (pattern: StepPattern, providedOptions?: ProvidedStepOptions) => {
    // offset = 3 b/c this call is 3 steps below the user's code
    const location = getLocationByOffset(3);
    // context parameter is required for decorator by TS even though it's not used
    return (method: StepDefinitionOptions['fn'], _context: ClassMethodDecoratorContext) => {
      saveStepConfigToMethod(method, {
        keyword,
        pattern,
        location,
        providedOptions,
        fn: method,
      });
    };
  };
}

export function linkStepsWithPomNode(Ctor: Function, pomNode: PomNode) {
  if (!Ctor?.prototype) return;
  const propertyDescriptors = Object.getOwnPropertyDescriptors(Ctor.prototype);
  return Object.values(propertyDescriptors).forEach((descriptor) => {
    const stepOptionsArray = getStepOptionsFromMethod(descriptor);
    if (!stepOptionsArray) return;

    // Register each step definition from the array
    stepOptionsArray.forEach((stepOptions) => {
      stepOptions.pomNode = pomNode;
      stepOptions.defaultTags = pomNode.fixtureTags;
      registerDecoratorStep(stepOptions);
    });
  });
}

// todo: link decorator steps with customTest!

function registerDecoratorStep(stepOptions: StepDefinitionOptions) {
  const { fn } = stepOptions;

  registerStepDefinition({
    ...stepOptions,
    fn: (fixturesArg: Record<string, unknown>, ...args: unknown[]) => {
      const pomFixture = getFirstNonAutoInjectFixture(fixturesArg, stepOptions);
      return fn.call(pomFixture, ...args);
    },
  });
}

function getFirstNonAutoInjectFixture(
  fixturesArg: Record<string, unknown>,
  { pattern }: StepDefinitionOptions,
) {
  // there should be exactly one suitable fixture in fixturesArg
  const fixtureNames = Object.keys(fixturesArg).filter(
    (fixtureName) => !isBddAutoInjectFixture(fixtureName),
  );

  const firstFixtureName = fixtureNames[0];
  if (!firstFixtureName) {
    throw new Error(`No suitable fixtures found for decorator step "${pattern}"`);
  }

  if (fixtureNames.length > 1) {
    throw new Error(`Several suitable fixtures found for decorator step "${pattern}"`);
  }

  return fixturesArg[firstFixtureName];
}

function saveStepConfigToMethod(
  method: StepDefinitionOptions['fn'],
  stepConfig: StepDefinitionOptions,
) {
  const decoratedMethod = method as unknown as DecoratedMethod;

  // Support multiple decorators by storing array of step configs
  if (!decoratedMethod[decoratedStepSymbol]) {
    decoratedMethod[decoratedStepSymbol] = [];
  }

  decoratedMethod[decoratedStepSymbol].push(stepConfig);
}

function getStepOptionsFromMethod(descriptor: PropertyDescriptor) {
  // filter out getters / setters
  return typeof descriptor.value === 'function'
    ? (descriptor.value as DecoratedMethod)[decoratedStepSymbol]
    : undefined;
}
