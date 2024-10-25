/**
 * Worker-level hooks: BeforeAll / AfterAll.
 */

/* eslint-disable max-depth */

import { WorkerInfo } from '@playwright/test';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { KeyValue, TestTypeCommon } from '../playwright/types';
import { callWithTimeout } from '../utils';

export type WorkerHookType = 'beforeAll' | 'afterAll';

type WorkerHookOptions = {
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
  // Since playwright-bdd v8 we run worker hooks via test.beforeAll / test.afterAll in each test file,
  // so we need to know if hook was executed to avoid double execution every test file.
  executed?: boolean;
  customTest?: TestTypeCommon;
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
export function createBeforeAllAfterAll<Fixtures extends KeyValue>(
  type: WorkerHookType,
  customTest: TestTypeCommon | undefined,
) {
  type Args = WorkerHookDefinitionArgs<Fixtures>;
  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as WorkerHookOptions,
      fn: getFnFromArgs(args) as WorkerHook['fn'],
      customTest,
    });
  };
}

// eslint-disable-next-line visual/complexity
export async function runWorkerHooks(type: WorkerHookType, fixtures: WorkerHookFixtures) {
  const hooksToRun = getWorkerHooksToRun(type);
  let error;
  for (const hook of hooksToRun) {
    try {
      await runWorkerHook(hook, fixtures);
    } catch (e) {
      if (type === 'beforeAll') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

async function runWorkerHook(hook: WorkerHook, fixtures: WorkerHookFixtures) {
  if (!hook.executed) {
    hook.executed = true;
    const { timeout } = hook.options;
    await callWithTimeout(() => hook.fn(fixtures), timeout, getTimeoutMessage(hook));
  }
}

export function getWorkerHooksToRun(type: WorkerHookType) {
  return workerHooks.filter((hook) => hook.type === type);
  // todo: add tags
  // .filter((hook) => !hook.tagsExpression || hook.tagsExpression.evaluate(tags));
}

export function getWorkerHooksFixtureNames(hooks: WorkerHook[]) {
  const fixtureNames = new Set<string>();

  hooks.forEach((hook) => {
    fixtureParameterNames(hook.fn).forEach((fixtureName) => fixtureNames.add(fixtureName));
  });

  return [...fixtureNames];
}

function getOptionsFromArgs(args: unknown[]) {
  if (typeof args[0] === 'object') return args[0];
  return {};
}

function getFnFromArgs(args: unknown[]) {
  return args.length === 1 ? args[0] : args[1];
}

function addHook(hook: WorkerHook) {
  if (hook.type === 'beforeAll') {
    workerHooks.push(hook);
  } else {
    // 'afterAll' hooks run in reverse order
    workerHooks.unshift(hook);
  }
}

function getTimeoutMessage(hook: WorkerHook) {
  const { timeout } = hook.options;
  return `${hook.type} hook timeout (${timeout} ms)`;
}
