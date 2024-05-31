import { BddWorld, BddWorldFixtures } from '../bddWorld';
import { TestTypeCommon } from '../../playwright/types';
import { IRunConfiguration } from '@cucumber/cucumber/api';
import { StepInvoker } from '../StepInvoker';
import { ISupportCodeLibrary } from '../../cucumber/types';
import { TestMeta, TestMetaMap } from '../../gen/testMeta';
import { BDDConfig } from '../../config/types';

export type StepFixture = {
  title: string;
};

export type BddFixtures = {
  // fixtures injected into BddWorld:
  // empty object for pw-style, builtin fixtures for cucumber-style
  $bddWorldFixtures: BddWorldFixtures;
  $bddWorld: BddWorld;
  Given: StepInvoker['invoke'];
  When: StepInvoker['invoke'];
  Then: StepInvoker['invoke'];
  And: StepInvoker['invoke'];
  But: StepInvoker['invoke'];
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
  $newCucumberStyleWorld: unknown;
};

export type BddFixturesWorker = {
  $cucumber: {
    runConfiguration: IRunConfiguration;
    supportCodeLibrary: ISupportCodeLibrary;
    World: typeof BddWorld;
    config: BDDConfig;
  };
  $workerHookFixtures: Record<string, unknown>;
  $beforeAll: void;
  $afterAll: void;
};
