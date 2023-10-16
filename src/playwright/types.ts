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

export type KeyValue = { [key: string]: any };

export type BuiltInFixtures = PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions;

export type FixturesArg<T extends KeyValue = {}, W extends KeyValue = {}> = T & W & BuiltInFixtures;

export type TestTypeCommon = TestType<KeyValue, KeyValue>;

// T can be typeof test or fixtures type itself
export type Fixtures<T extends KeyValue> = T extends TestType<infer U, infer W>
  ? Omit<U & W, symbol | number>
  : T;

export type CustomFixtures<T extends KeyValue> = Omit<
  Fixtures<T>,
  keyof (BuiltInFixtures & BddFixtures) | symbol | number
>;
