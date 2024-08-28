/**
 * Some playwright types.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestInfo,
  TestType,
} from '@playwright/test';

import { Location as PlaywrightLocation } from '@playwright/test/reporter';

export type KeyValue = { [key: string]: any };
export type TestTypeCommon = TestType<KeyValue, KeyValue>;

export type PwBuiltInFixturesWorker = PlaywrightWorkerArgs & PlaywrightWorkerOptions;
export type PwBuiltInFixturesTest = PlaywrightTestArgs & PlaywrightTestOptions;

export type PwAttachment = TestInfo['attachments'][0];
export type PwAnnotation = TestInfo['annotations'][0];

// cucumber has also Location type, but:
// - it does not contain file
// - column is optional
export { PlaywrightLocation };

export type DescribeConfigureOptions = {
  mode?: 'default' | 'parallel' | 'serial';
  retries?: number;
  timeout?: number;
};
