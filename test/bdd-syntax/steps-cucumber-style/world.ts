import { TestInfo } from '@playwright/test';
import { BddStepInfo } from '../../../src/runtime/bddContext';

export type World = {
  testInfo: TestInfo;
  tags: string[];
  step: BddStepInfo;
  [key: string]: unknown;
};
