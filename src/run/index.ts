import { TestType } from '@playwright/test';
import { loadConfig } from '../cucumber/config';
import { loadSteps } from '../cucumber/steps';
import { customFixtures } from '../pwstyle';
import { FixturesDefinition, KeyValue } from '../pwstyle/types';
import { test as base } from './defaultFixtures';

let test: TestType<KeyValue, KeyValue>;

/**
 * Extend test with custom fixtures (once)
 */
export function createTest(customFixturesDefinition?: FixturesDefinition) {
  if (!test) {
    test = customFixturesDefinition ? base.extend(customFixturesDefinition) : base;
  }
  return test;
}

/**
 * Wrapper when using fixture, allowing to load step definitions first
 * and then actually use fixtures from loaded code.
 */
export async function useFixture(name: keyof FixturesDefinition, ...args: unknown[]) {
  const { runConfiguration } = await loadConfig();
  await loadSteps(runConfiguration);
  const customFixture = customFixtures[name];
  if (!customFixture) throw new Error(`Fixture "${name}" not found`);
  const fixtureFn = Array.isArray(customFixture) ? customFixture[0] : customFixture;
  if (typeof fixtureFn !== 'function') {
    throw new Error(`Expected fixture definition function`);
  }
  // @ts-expect-error args are correct
  return fixtureFn(...args);
}
