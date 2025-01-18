/**
 * Universal file that produces Given/When/Then and Hooks
 * for cucumber OR playwright-bdd depending on env var.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cucumber from '@cucumber/cucumber';
import { TestInfo } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

export const isPlaywrightRun = Boolean(process.env.PLAYWRIGHT_BDD_CONFIGS);

export const test = base.extend<{ world: { testInfo: TestInfo } }>({
  world: ({}, use, testInfo) => use({ testInfo }),
});
const pwBdd = createBdd(test, { worldFixture: 'world' });

type StepFn = (this: Record<string, any>, ...args: any[]) => unknown;

export const Given = function (pattern: string, fn: StepFn) {
  return isPlaywrightRun ? pwBdd.Given(pattern, fn) : cucumber.Given(pattern, fn);
};

export const When = function (pattern: string, fn: StepFn) {
  return isPlaywrightRun ? pwBdd.When(pattern, fn) : cucumber.When(pattern, fn);
};

export const Then = function (pattern: string, fn: StepFn) {
  return isPlaywrightRun ? pwBdd.Then(pattern, fn) : cucumber.Then(pattern, fn);
};

type HookCtorArgs = [any, StepFn] | [StepFn];
export const Before = function (...args: HookCtorArgs) {
  const { options, fn } = getHookCtorArgs(args);
  return isPlaywrightRun ? pwBdd.Before(options, fn) : cucumber.Before(options, fn);
};

export const After = function (...args: HookCtorArgs) {
  const { options, fn } = getHookCtorArgs(args);
  return isPlaywrightRun ? pwBdd.After(options, fn) : cucumber.After(options, fn);
};

export const BeforeAll = function (...args: HookCtorArgs) {
  const { options, fn } = getHookCtorArgs(args);
  return isPlaywrightRun ? pwBdd.BeforeAll(options, fn) : cucumber.BeforeAll(options, fn);
};

export const AfterAll = function (...args: HookCtorArgs) {
  const { options, fn } = getHookCtorArgs(args);
  return isPlaywrightRun ? pwBdd.AfterAll(options, fn) : cucumber.AfterAll(options, fn);
};

function getHookCtorArgs(args: HookCtorArgs) {
  return args.length === 1 ? { options: {}, fn: args[0] } : { options: args[0], fn: args[1] };
}
