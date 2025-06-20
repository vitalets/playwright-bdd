/**
 * BDD context is an object created for each test.
 * Contains all necessary data for BDD test execution.
 */
import { BDDConfig } from '../config/types';
import { TestTypeCommon } from '../playwright/types';
import { TestInfo } from '@playwright/test';
import { BddTestData } from '../bddData/types';

export type BddStepInfo = {
  title: string;
};

export type BddContext = {
  config: BDDConfig;
  featureUri: string;
  test: TestTypeCommon;
  testInfo: TestInfo;
  tags: string[];
  step: BddStepInfo;
  stepIndex: number; // step index in pickle (differs from index in scenario, b/c bg steps)
  bddTestData: BddTestData;
  // We don't store 'world' fixture here, as world can depend on page and lead to circular dependency.
  // See: https://github.com/vitalets/playwright-bdd/issues/319
};
