/**
 * Worker-level hooks: BeforeAll / AfterAll.
 */

/* eslint-disable max-depth */

import { WorkerInfo } from '@playwright/test';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { KeyValue } from '../playwright/types';
import { callWithTimeout } from '../utils';

type WorkerHookOptions = {
  timeout?: number;
};

type WorkerHookBddFixtures = {
  $workerInfo: WorkerInfo;
};

type WorkerHookFn<Fixtures> = (fixtures: Fixtures) => unknown;

type WorkerHook<Fixtures = object> = {
  type: 'beforeAll' | 'afterAll';
  options: WorkerHookOptions;
  fn: WorkerHookFn<Fixtures>;
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
let workerHooksFixtures: string[];

/**
 * Returns BeforeAll() / AfterAll() functions.
 */
export function workerHookFactory<WorkerFixtures extends KeyValue>(type: WorkerHook['type']) {
  type Args = WorkerHookDefinitionArgs<WorkerFixtures & WorkerHookBddFixtures>;
  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as WorkerHookOptions,
      fn: getFnFromArgs(args) as WorkerHook['fn'],
    });
  };
}

// eslint-disable-next-line visual/complexity
export async function runWorkerHooks<Fixtures extends WorkerHookBddFixtures>(
  type: WorkerHook['type'],
  fixtures: Fixtures,
) {
  let error;
  for (const hook of workerHooks) {
    if (hook.type !== type) continue;

    const { timeout } = hook.options;
    try {
      await callWithTimeout(() => hook.fn(fixtures), timeout, getTimeoutMessage(hook));
    } catch (e) {
      if (type === 'beforeAll') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

export function getWorkerHooksFixtures() {
  if (!workerHooksFixtures) {
    const fixturesFakeObj: Record<keyof WorkerHookBddFixtures, null> = {
      $workerInfo: null,
    };
    const set = new Set<string>();
    workerHooks.forEach((hook) => {
      fixtureParameterNames(hook.fn)
        .filter((fixtureName) => !Object.hasOwn(fixturesFakeObj, fixtureName))
        .forEach((fixtureName) => set.add(fixtureName));
    });
    workerHooksFixtures = [...set];
  }

  return workerHooksFixtures;
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
