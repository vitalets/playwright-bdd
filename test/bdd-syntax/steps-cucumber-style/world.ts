import { TestInfo } from '@playwright/test';
import type { BddTestFixtures } from 'playwright-bdd';

export type World = {
  testInfo: TestInfo;
  tags: string[];
  step: BddTestFixtures['$step'];
  [key: string]: unknown;
};
