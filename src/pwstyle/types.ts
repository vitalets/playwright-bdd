/**
 * Some playwright types.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test';

export type KeyValue = { [key: string]: any };

export type FixturesDefinition<T extends KeyValue = {}, W extends KeyValue = {}> = Fixtures<
  T,
  W,
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

export type FixturesArg<T extends KeyValue = {}, W extends KeyValue = {}> = T &
  W &
  PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions;
