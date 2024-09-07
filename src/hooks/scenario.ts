/**
 * Scenario level hooks: Before / After.
 *
 * before(async ({ page }) => {})
 */

/* eslint-disable max-depth */

import { TestInfo } from '@playwright/test';
import parseTagsExpression from '@cucumber/tag-expressions';
import { KeyValue, PlaywrightLocation } from '../playwright/types';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { callWithTimeout } from '../utils';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { BddContext } from '../run/bddFixtures/test';

type ScenarioHookOptions = {
  name?: string;
  tags?: string;
  timeout?: number;
};

// todo: replace with auto-inject fixtures
type ScenarioHookBddFixtures = {
  $bddContext: BddContext;
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
>(type: ScenarioHookType) {
  type AllFixtures = TestFixtures & WorkerFixtures & ScenarioHookBddFixtures;
  type Args = ScenarioHookDefinitionArgs<AllFixtures, World>;

  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as ScenarioHookOptions,
      // fn: getFnFromArgs(args) as ScenarioHook<AllFixtures, World>['fn'],
      fn: getFnFromArgs(args) as ScenarioHookFn<AllFixtures, World>,
      // offset = 3 b/c this call is 3 steps below the user's code
      location: getLocationByOffset(3),
    });
  };
}

// eslint-disable-next-line visual/complexity
export async function runScenarioHooks<Fixtures extends ScenarioHookBddFixtures>(
  type: ScenarioHookType,
  fixtures: Fixtures,
) {
  let error;
  for (const hook of scenarioHooks) {
    if (hook.type !== type) continue;
    if (hook.tagsExpression && !hook.tagsExpression.evaluate(fixtures.$tags)) continue;

    try {
      const hookFn = wrapHookFn(hook, fixtures);
      await runStepWithLocation(
        fixtures.$bddContext.test,
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
    const fixtureNames = new Set<string>();
    scenarioHooks.forEach((hook) => {
      fixtureParameterNames(hook.fn).forEach((fixtureName) => fixtureNames.add(fixtureName));
    });

    const excludeFixtureNames: Record<keyof ScenarioHookBddFixtures, null> = {
      $bddContext: null,
      $tags: null,
      $testInfo: null,
    };
    Object.keys(excludeFixtureNames).forEach((fixtureName) => fixtureNames.delete(fixtureName));

    scenarioHooksFixtures = [...fixtureNames];
  }

  return scenarioHooksFixtures;
}

/**
 * Wraps hook fn with timeout and waiting Cucumber attachments to fulfill.
 */
function wrapHookFn(hook: GeneralScenarioHook, fixtures: ScenarioHookBddFixtures) {
  const { timeout } = hook.options;
  const { $bddContext } = fixtures;

  return async () => {
    await callWithTimeout(
      () => hook.fn.call($bddContext.world, fixtures),
      timeout,
      getTimeoutMessage(hook),
    );
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
