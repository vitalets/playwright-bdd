import { TestInfo } from '@playwright/test';

export type World = {
  testInfo: TestInfo;
  tags: string[];
  [key: string]: unknown;
};
