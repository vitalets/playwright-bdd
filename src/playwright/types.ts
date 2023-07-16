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

export type KeyValue = { [key: string]: any };

export type BuiltInFixtures = PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions;

export type FixturesArg<T extends KeyValue = {}, W extends KeyValue = {}> = T & W & BuiltInFixtures;

export type TestTypeCommon = TestType<KeyValue, KeyValue>;
