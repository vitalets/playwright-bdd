/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cucumber from '@cucumber/cucumber';
import { test as base, createBdd } from 'playwright-bdd';

const isPlaywrightRun = Boolean(process.env.PLAYWRIGHT_BDD_CONFIGS);

export const test = base.extend({
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

export const Before = function (options: any, fn: StepFn) {
  return isPlaywrightRun ? pwBdd.Before(options, fn) : cucumber.Before(options, fn);
};

export const After = function (options: any, fn: StepFn) {
  return isPlaywrightRun ? pwBdd.After(options, fn) : cucumber.After(options, fn);
};
