import { TestTypeCommon } from '../playwright/types';
import { StepKeywordFixture } from './invokeStep';
import { TestMeta, TestMetaMap } from '../gen/testMeta';
import { BDDConfig } from '../config/types';
import { TestInfo } from '@playwright/test';
import { BddDataManager } from './bddData';

type StepFixture = {
  title: string;
};

export type BddFixtures = {
  $bddContext: BddContext;
  Given: StepKeywordFixture;
  When: StepKeywordFixture;
  Then: StepKeywordFixture;
  And: StepKeywordFixture;
  But: StepKeywordFixture;
  $testMetaMap: TestMetaMap;
  $testMeta: TestMeta;
  $tags: string[];
  $test: TestTypeCommon;
  $step: StepFixture;
  $uri: string;
  $scenarioHookFixtures: Record<string, unknown>;
  $before: void;
  $after: void;
  $lang: string;
  $applySpecialTags: void;
  $world: unknown;
};

export type BddFixturesWorker = {
  $bddContextWorker: BddContextWorker;
  $workerHookFixtures: Record<string, unknown>;
  $beforeAll: void;
  $afterAll: void;
};

export type BddContext = BddContextWorker & {
  test: TestTypeCommon;
  testInfo: TestInfo;
  lang: string;
  tags: string[];
  step: StepFixture;
  // currentStepFixtures: Fixtures<TestTypeCommon>;
  world: unknown;
  bddDataManager?: BddDataManager;
};

type BddContextWorker = {
  config: BDDConfig;
};
