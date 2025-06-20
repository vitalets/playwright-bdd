/**
 * Step level hooks: BeforeStep / AfterStep.
 */

/* eslint-disable max-depth */

import { KeyValue, PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { callWithTimeout } from '../utils';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { BddAutoInjectFixtures, isBddAutoInjectFixture } from '../runtime/bddTestFixturesAuto';
import { HookConstructorOptions, setTagsExpression } from './shared';
import { TagsExpression } from '../steps/tags';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';

type StepHookType = 'beforeStep' | 'afterStep';

type StepHookOptions = {
  name?: string;
  tags?: string;
  timeout?: number;
};

type StepHookFixtures = BddAutoInjectFixtures & {
  [key: string]: unknown;
};

type StepHookFn<Fixtures, World> = (this: World, fixtures: Fixtures) => unknown;

type StepHook<Fixtures, World> = {
  type: StepHookType;
  options: StepHookOptions;
  fn: StepHookFn<Fixtures, World>;
  tagsExpression?: TagsExpression;
  location: PlaywrightLocation; // absolute path to hook location, line and col
  customTest?: TestTypeCommon;
  defaultTags?: string;
  worldFixture?: string;
};

/**
 * When calling BeforeStep() / After() you can pass:
 * 1. hook fn
 * 2. tags string + hook fn
 * 3. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteroptions-fn
 */
type StepHookDefinitionArgs<Fixtures, World> =
  | [StepHookFn<Fixtures, World>]
  | [NonNullable<StepHookOptions['tags']>, StepHookFn<Fixtures, World>]
  | [StepHookOptions, StepHookFn<Fixtures, World>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeneralStepHook = StepHook<any, any>;

const stepHooks: GeneralStepHook[] = [];

/**
 * Returns BeforeStep() / AfterStep() functions.
 */
export function stepHookFactory<
  TestFixtures extends KeyValue,
  WorkerFixtures extends KeyValue,
  World,
>(type: StepHookType, { customTest, defaultTags, worldFixture }: HookConstructorOptions) {
  type AllFixtures = TestFixtures & WorkerFixtures;
  type Args = StepHookDefinitionArgs<AllFixtures, World>;

  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as StepHookOptions,
      fn: getFnFromArgs(args) as StepHookFn<AllFixtures, World>,
      // offset = 3 b/c this call is 3 steps below the user's code
      location: getLocationByOffset(3),
      customTest,
      defaultTags,
      worldFixture,
    });
  };
}

// eslint-disable-next-line visual/complexity
export async function runStepHooks(
  hooks: GeneralStepHook[],
  world: unknown,
  fixtures: StepHookFixtures,
) {
  let error;
  for (const hook of hooks) {
    try {
      await runStepHook(hook, world, fixtures);
    } catch (e) {
      if (hook.type === 'beforeStep') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

// todo: join with getScenarioHooksFixtureNames(),
// make universal function getHooksFixtureNames()
export function getStepHooksFixtureNames(hooks: GeneralStepHook[]) {
  const fixtureNames = new Set<string>();

  hooks.forEach((hook) => {
    const hookFixtureNames = fixtureParameterNames(hook.fn);
    hookFixtureNames.forEach((fixtureName) => fixtureNames.add(fixtureName));
  });

  return [...fixtureNames].filter((name) => !isBddAutoInjectFixture(name));
}

async function runStepHook(hook: GeneralStepHook, world: unknown, fixtures: StepHookFixtures) {
  const hookFn = wrapHookFnWithTimeout(hook, world, fixtures);
  const stepTitle = hook.options.name;
  // wrap hookFn call into test.step() only if user provided a name for the hook,
  // otherwise run as is to avoid extra level in the steps structure.
  if (stepTitle) {
    await runStepWithLocation(fixtures.$bddContext.test, stepTitle, hook.location, hookFn);
  } else {
    await hookFn();
  }
}

export function getStepHooksToRun(type: StepHookType, tags: string[] = []) {
  return stepHooks
    .filter((hook) => hook.type === type)
    .filter((hook) => !hook.tagsExpression || hook.tagsExpression.evaluate(tags));
}

/**
 * Wraps hook fn with timeout.
 */
function wrapHookFnWithTimeout(hook: GeneralStepHook, world: unknown, fixtures: StepHookFixtures) {
  const { timeout } = hook.options;

  return async () => {
    await callWithTimeout(() => hook.fn.call(world, fixtures), timeout, getTimeoutMessage(hook));
  };
}

function getOptionsFromArgs(args: unknown[]) {
  if (typeof args[0] === 'string') return { tags: args[0] };
  if (typeof args[0] === 'object') return args[0];
  return {};
}

function getFnFromArgs(args: unknown[]) {
  return args.length === 1 ? args[0] : args[1];
}

function addHook(hook: GeneralStepHook) {
  setTagsExpression(hook);
  stepHooks.push(hook);
}

function getTimeoutMessage(hook: GeneralStepHook) {
  const { timeout, name: hookName } = hook.options;
  return `${hook.type} hook ${hookName ? `"${hookName}" ` : ''}timeout (${timeout} ms)`;
}
