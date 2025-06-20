/**
 * Scenario level hooks: Before / After.
 */

/* eslint-disable max-depth */

import { KeyValue, PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { callWithTimeout } from '../utils';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { getBddAutoInjectFixtures, isBddAutoInjectFixture } from '../runtime/bddTestFixturesAuto';
import { HookConstructorOptions, setTagsExpression } from './shared';
import { TagsExpression } from '../steps/tags';
import { BddContext } from '../runtime/bddContext';

export type ScenarioHookType = 'before' | 'after';

type ScenarioHookOptions = {
  name?: string;
  tags?: string;
  timeout?: number;
};

type ScenarioHookFixtures = {
  $bddContext: BddContext;
  [key: string]: unknown;
};

type ScenarioHookFn<Fixtures, World> = (this: World, fixtures: Fixtures) => unknown;

type ScenarioHook<Fixtures, World> = {
  type: ScenarioHookType;
  options: ScenarioHookOptions;
  fn: ScenarioHookFn<Fixtures, World>;
  tagsExpression?: TagsExpression;
  location: PlaywrightLocation; // absolute path to hook location, line and col
  customTest?: TestTypeCommon;
  defaultTags?: string;
  worldFixture?: string;
};

/**
 * When calling Before() / After() you can pass:
 * 1. hook fn
 * 2. tags string + hook fn
 * 3. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteroptions-fn
 */
type ScenarioHookDefinitionArgs<Fixtures, World> =
  | [ScenarioHookFn<Fixtures, World>]
  | [NonNullable<ScenarioHookOptions['tags']>, ScenarioHookFn<Fixtures, World>]
  | [ScenarioHookOptions, ScenarioHookFn<Fixtures, World>];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeneralScenarioHook = ScenarioHook<any, any>;

const scenarioHooks: GeneralScenarioHook[] = [];

/**
 * Returns Before() / After() functions.
 */
export function scenarioHookFactory<
  TestFixtures extends KeyValue,
  WorkerFixtures extends KeyValue,
  World,
>(type: ScenarioHookType, { customTest, defaultTags, worldFixture }: HookConstructorOptions) {
  type AllFixtures = TestFixtures & WorkerFixtures;
  type Args = ScenarioHookDefinitionArgs<AllFixtures, World>;

  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as ScenarioHookOptions,
      fn: getFnFromArgs(args) as ScenarioHookFn<AllFixtures, World>,
      // offset = 3 b/c this call is 3 steps below the user's code
      location: getLocationByOffset(3),
      customTest,
      defaultTags,
      worldFixture,
    });
  };
}

// eslint-disable-next-line visual/complexity
export async function runScenarioHooks(
  hooks: GeneralScenarioHook[],
  world: unknown,
  fixtures: ScenarioHookFixtures,
) {
  let error;
  for (const hook of hooks) {
    try {
      await runScenarioHook(hook, world, fixtures);
    } catch (e) {
      if (hook.type === 'before') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

async function runScenarioHook(
  hook: GeneralScenarioHook,
  world: unknown,
  fixtures: ScenarioHookFixtures,
) {
  const fn = wrapHookFnWithTimeout(hook, world, fixtures);
  const stepTitle = getHookStepTitle(hook);
  await runStepWithLocation(fixtures.$bddContext.test, stepTitle, hook.location, fn);
}

export function getScenarioHooksFixtureNames(hooks: GeneralScenarioHook[]) {
  const fixtureNames = new Set<string>();

  hooks.forEach((hook) => {
    const hookFixtureNames = fixtureParameterNames(hook.fn);
    hookFixtureNames.forEach((fixtureName) => fixtureNames.add(fixtureName));
  });

  return [...fixtureNames].filter((name) => !isBddAutoInjectFixture(name));
}

export function getScenarioHooksToRun(type: ScenarioHookType, tags: string[] = []) {
  return scenarioHooks
    .filter((hook) => hook.type === type)
    .filter((hook) => !hook.tagsExpression || hook.tagsExpression.evaluate(tags));
}

/**
 * Wraps hook fn with timeout.
 */
function wrapHookFnWithTimeout(
  hook: GeneralScenarioHook,
  world: unknown,
  fixtures: ScenarioHookFixtures,
) {
  const { timeout } = hook.options;
  const { $bddContext } = fixtures;
  const fixturesArg = {
    ...fixtures,
    ...getBddAutoInjectFixtures($bddContext),
  };

  return async () => {
    await callWithTimeout(() => hook.fn.call(world, fixturesArg), timeout, getTimeoutMessage(hook));
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

function addHook(hook: GeneralScenarioHook) {
  setTagsExpression(hook);
  scenarioHooks.push(hook);
}

function getTimeoutMessage(hook: GeneralScenarioHook) {
  const { timeout, name: hookName } = hook.options;
  return `${hook.type} hook ${hookName ? `"${hookName}" ` : ''}timeout (${timeout} ms)`;
}

function getHookStepTitle(hook: GeneralScenarioHook) {
  return hook.options.name || (hook.type === 'before' ? 'BeforeEach hook' : 'AfterEach hook');
}
