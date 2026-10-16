import { TestInfo } from '@playwright/test';
import { BddStepFixture } from '../../../src/runtime/bddStepState';

export type World = {
  testInfo: TestInfo;
  tags: string[];
  step: BddStepFixture;
  [key: string]: unknown;
};
