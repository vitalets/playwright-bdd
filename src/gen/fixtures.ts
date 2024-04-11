/* eslint-disable @typescript-eslint/ban-types */

import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { isBddAutoInjectFixture } from '../run/bddFixtures/autoInject';
import { exit } from '../utils/exit';

const bodyFixturesSymbol = Symbol('bodyFixtures');

type FunctionWithBodyFixtures = Function & { [bodyFixturesSymbol]: string[] };

/**
 * This function is used for playwright-style steps and decorators.
 * It extracts fixtures names from first parameter of function
 * using Playwright's helper.
 */
export function extractFixtureNames(fn?: Function) {
  return fixtureParameterNames(fn).filter((name) => !isBddAutoInjectFixture(name));
}

/**
 * This function is used for cucumber-style steps.
 * It looks for `this.useFixture('xxx')` entries in function body
 * and extracts fixtures names from it.
 */
export function extractFixtureNamesFromFnBodyMemo(fn?: Function) {
  if (typeof fn !== 'function') return [];
  const fnWithFixtures = fn as FunctionWithBodyFixtures;
  if (!fnWithFixtures[bodyFixturesSymbol]) {
    fnWithFixtures[bodyFixturesSymbol] = extractFixtureNamesFromFnBody(fn).filter(
      (name) => !isBddAutoInjectFixture(name),
    );
  }
  return fnWithFixtures[bodyFixturesSymbol];
}

function extractFixtureNamesFromFnBody(fn: Function) {
  const matches = fn.toString().matchAll(/this\.useFixture\((.+)\)/gi) || [];
  return [...matches].map((match) => getFixtureName(match[1]));
}

function getFixtureName(arg: string) {
  if (!/^['"`]/.test(arg)) {
    // todo: log file location with incorrect useFixture
    exit('this.useFixture() can accept only static string as an argument.');
  }

  if (arg.startsWith('`') && arg.includes('${')) {
    exit('this.useFixture() can accept only static string as an argument.');
  }

  return arg.replace(/['"`]/g, '');
}
