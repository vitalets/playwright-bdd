/**
 * Some playwright types.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
} from '@playwright/test';
import { BddFixtures } from '../run/bddFixtures';
import { TestResult, Location as PlaywrightLocation } from '@playwright/test/reporter';

export type KeyValue = { [key: string]: any };

export type BuiltInFixturesWorker = PlaywrightWorkerArgs & PlaywrightWorkerOptions;
export type BuiltInFixtures = PlaywrightTestArgs & PlaywrightTestOptions & BuiltInFixturesWorker;

export type FixturesArg<T extends KeyValue = {}, W extends KeyValue = {}> = T & W & BuiltInFixtures;

export type TestTypeCommon = TestType<KeyValue, KeyValue>;

// T can be typeof test or fixtures type itself
export type Fixtures<T extends KeyValue> =
  T extends TestType<infer U, infer W> ? Omit<U & W, symbol | number> : T;

export type CustomFixtures<T extends KeyValue> = Omit<
  Fixtures<T>,
  keyof (BuiltInFixtures & BddFixtures) | symbol | number
>;

export type PwAttachment = TestResult['attachments'][0];

// cucumber has also Location type, but:
// - it does not contain file
// - column is optional
export { PlaywrightLocation };
