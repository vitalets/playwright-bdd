/**
 * Worker-level hooks: BeforeAll / AfterAll.
 */

/* eslint-disable max-depth */

import { WorkerInfo } from '@playwright/test';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { KeyValue, PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { callWithTimeout } from '../utils';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { HookConstructorOptions, setTagsExpression } from './shared';
import { TagsExpression } from '../steps/tags';

export type WorkerHookType = 'beforeAll' | 'afterAll';

type WorkerHookOptions = {
  name?: string;
  tags?: string;
  timeout?: number;
};

type WorkerHookFixtures = {
  $workerInfo: WorkerInfo;
  [key: string]: unknown;
};

type WorkerHookFn<Fixtures> = (fixtures: Fixtures) => unknown;

export type WorkerHook<Fixtures = object> = {
  type: WorkerHookType;
  options: WorkerHookOptions;
  fn: WorkerHookFn<Fixtures>;
  tagsExpression?: TagsExpression;
  location: PlaywrightLocation;
  customTest?: TestTypeCommon;
  defaultTags?: string;
  // Since playwright-bdd v8 we run worker hooks via test.beforeAll / test.afterAll in each test file,
  // so we need to know if hook was executed to avoid double execution in every test file.
  executed?: boolean;
};

export type WorkerHookRunInfo = {
  test: TestTypeCommon;
  hook: WorkerHook;
  fixtures: WorkerHookFixtures;
};

/**
 * When calling BeforeAll() / AfterAll() you can pass:
 * 1. hook fn
 * 2. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteralloptions-fn
 */
type WorkerHookDefinitionArgs<Fixtures> =
  | [WorkerHookFn<Fixtures>]
  | [WorkerHookOptions, WorkerHookFn<Fixtures>];

const workerHooks: WorkerHook[] = [];

/**
 * Returns BeforeAll() / AfterAll() functions.
 */
export function workerHookFactory<Fixtures extends KeyValue>(
  type: WorkerHookType,
  { customTest, defaultTags }: HookConstructorOptions,
) {
  type Args = WorkerHookDefinitionArgs<Fixtures>;
  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as WorkerHookOptions,
      fn: getFnFromArgs(args) as WorkerHook['fn'],
      // offset = 3 b/c this call is 3 steps below the user's code
      location: getLocationByOffset(3),
      customTest,
      defaultTags,
    });
  };
}

// eslint-disable-next-line visual/complexity
export async function runWorkerHooks(hooksRunInfo: Map<WorkerHook, WorkerHookRunInfo>) {
  let error;
  for (const runInfo of hooksRunInfo.values()) {
    try {
      await runWorkerHook(runInfo);
    } catch (e) {
      if (runInfo.hook.type === 'beforeAll') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

async function runWorkerHook({ test, hook, fixtures }: WorkerHookRunInfo) {
  if (hook.executed) return;
  hook.executed = true;
  const hookFn = wrapHookFnWithTimeout(hook, fixtures);
  const stepTitle = getHookStepTitle(hook);
  // test.step() is not available for afterAll hooks.
  // See: https://github.com/microsoft/playwright/issues/33750
  // So all afterAll hooks are called under AfterAll step (with type = 'hook' in reporter)
  if (hook.type === 'beforeAll') {
    await runStepWithLocation(test, stepTitle, hook.location, hookFn);
  } else {
    await hookFn();
  }
}

export function getWorkerHooksToRun(type: WorkerHookType, tags: string[]) {
  return workerHooks
    .filter((hook) => hook.type === type)
    .filter((hook) => !hook.tagsExpression || hook.tagsExpression.evaluate(tags));
}

export function getWorkerHooksFixtureNames(hooks: WorkerHook[]) {
  const fixtureNames = new Set<string>();

  hooks.forEach((hook) => {
    fixtureParameterNames(hook.fn).forEach((fixtureName) => fixtureNames.add(fixtureName));
  });

  return [...fixtureNames];
}

/**
 * Wraps hook fn with timeout.
 */
function wrapHookFnWithTimeout(hook: WorkerHook, fixtures: WorkerHookFixtures) {
  const { timeout } = hook.options;

  return async () => {
    await callWithTimeout(
      // call with null to avoid using 'this' inside worker hook
      () => hook.fn.call(null, fixtures),
      timeout,
      getTimeoutMessage(hook),
    );
  };
}

function getOptionsFromArgs(args: unknown[]) {
  if (typeof args[0] === 'object') return args[0];
  return {};
}

function getFnFromArgs(args: unknown[]) {
  return args.length === 1 ? args[0] : args[1];
}

function addHook(hook: WorkerHook) {
  setTagsExpression(hook);
  workerHooks.push(hook);
}

function getTimeoutMessage(hook: WorkerHook) {
  const { timeout } = hook.options;
  return `${hook.type} hook timeout (${timeout} ms)`;
}

function getHookStepTitle(hook: WorkerHook) {
  return hook.options.name || (hook.type === 'beforeAll' ? 'BeforeAll hook' : 'AfterAll hook');
}
