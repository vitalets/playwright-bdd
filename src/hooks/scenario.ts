/**
 * Scenario level hooks: Before / After.
 *
 * before(async ({ page }) => {})
 */

/* eslint-disable max-depth */

import { TestInfo } from '@playwright/test';
import parseTagsExpression from '@cucumber/tag-expressions';
import { BddWorld } from '../run/bddWorld';
import { KeyValue, PlaywrightLocation } from '../playwright/types';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { callWithTimeout } from '../utils';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { runStepWithCustomLocation } from '../playwright/testTypeImpl';

type ScenarioHookOptions = {
  name?: string;
  tags?: string;
  timeout?: number;
};

type ScenarioHookBddFixtures<World> = {
  $bddWorld: World;
  $tags: string[];
  $testInfo: TestInfo;
};

type ScenarioHookFn<Fixtures, World> = (this: World, fixtures: Fixtures) => unknown;

type ScenarioHookType = 'before' | 'after';

type ScenarioHook<Fixtures, World> = {
  type: ScenarioHookType;
  options: ScenarioHookOptions;
  fn: ScenarioHookFn<Fixtures, World>;
  tagsExpression?: ReturnType<typeof parseTagsExpression>;
  location: PlaywrightLocation;
  useWorldFixture: boolean; // for new cucumber-style steps
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
type GeneralScenarioHook = ScenarioHook<any, any>;

const scenarioHooks: GeneralScenarioHook[] = [];
let scenarioHooksFixtures: string[];

/**
 * Returns Before() / After() functions.
 */
export function scenarioHookFactory<
  TestFixtures extends KeyValue,
  WorkerFixtures extends KeyValue,
  World,
>(type: ScenarioHookType, { useWorldFixture = false } = {}) {
  type AllFixtures = TestFixtures & WorkerFixtures & ScenarioHookBddFixtures<World>;
  type Args = ScenarioHookDefinitionArgs<AllFixtures, World>;

  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as ScenarioHookOptions,
      // fn: getFnFromArgs(args) as ScenarioHook<AllFixtures, World>['fn'],
      fn: getFnFromArgs(args) as ScenarioHookFn<AllFixtures, World>,
      // offset = 3 b/c this call is 3 steps below the user's code
      location: getLocationByOffset(3),
      useWorldFixture,
    });
  };
}

export function hasScenarioHooksWithWorldFromCucumber() {
  return scenarioHooks.filter((hook) => !hook.useWorldFixture).length > 0;
}

// eslint-disable-next-line complexity
export async function runScenarioHooks<
  World extends BddWorld,
  Fixtures extends ScenarioHookBddFixtures<World>,
>(type: ScenarioHookType, fixtures: Fixtures) {
  let error;
  for (const hook of scenarioHooks) {
    if (hook.type !== type) continue;
    if (hook.tagsExpression && !hook.tagsExpression.evaluate(fixtures.$tags)) continue;

    try {
      const hookFn = wrapHookFn(hook, fixtures);
      await runStepWithCustomLocation(
        fixtures.$bddWorld.test,
        hook.options.name || '',
        hook.location,
        hookFn,
      );
    } catch (e) {
      if (type === 'before') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

export function getScenarioHooksFixtures() {
  if (!scenarioHooksFixtures) {
    const fixturesFakeObj: Record<keyof ScenarioHookBddFixtures<BddWorld>, null> = {
      $bddWorld: null,
      $tags: null,
      $testInfo: null,
    };
    const set = new Set<string>();
    scenarioHooks.forEach((hook) => {
      fixtureParameterNames(hook.fn)
        .filter(
          (fixtureName) => !Object.prototype.hasOwnProperty.call(fixturesFakeObj, fixtureName),
        )
        .forEach((fixtureName) => set.add(fixtureName));
    });
    scenarioHooksFixtures = [...set];
  }

  return scenarioHooksFixtures;
}

/**
 * Wraps hook fn with timeout and waiting Cucumber attachments to fulfill.
 */
function wrapHookFn(hook: GeneralScenarioHook, fixtures: ScenarioHookBddFixtures<BddWorld>) {
  const { timeout } = hook.options;
  const { $bddWorld } = fixtures;
  const world = hook.useWorldFixture ? $bddWorld.$internal.newCucumberStyleWorld : $bddWorld;

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

function setTagsExpression(hook: GeneralScenarioHook) {
  if (hook.options.tags) {
    hook.tagsExpression = parseTagsExpression(hook.options.tags);
  }
}

function addHook(hook: GeneralScenarioHook) {
  setTagsExpression(hook);
  if (hook.type === 'before') {
    scenarioHooks.push(hook);
  } else {
    // 'after' hooks run in reverse order
    scenarioHooks.unshift(hook);
  }
}

function getTimeoutMessage(hook: GeneralScenarioHook) {
  const { timeout, name: hookName } = hook.options;
  return `${hook.type} hook ${hookName ? `"${hookName}" ` : ''}timeout (${timeout} ms)`;
}
