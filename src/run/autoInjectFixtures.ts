/**
 * Auto-inject fixtures are automatically injected into every step call
 * without explicitly passing them in the last argument of Given() / When() / Then().
 * It just reduces generated code visually.
 */

import { TestInfo } from '@playwright/test';
import { BddContext, BddFixtures } from './testFixtures';

export type BddAutoInjectFixtures = Pick<BddFixtures, '$test' | '$tags' | '$step'> & {
  $testInfo: TestInfo;
  $bddContext: BddContext;
};

const BDD_AUTO_INJECT_FIXTURES: Record<keyof BddAutoInjectFixtures, null> = {
  $tags: null,
  $test: null,
  $step: null,
  $testInfo: null,
  $bddContext: null,
};

export function isBddAutoInjectFixture(name: string) {
  return Object.hasOwn(BDD_AUTO_INJECT_FIXTURES, name as keyof BddAutoInjectFixtures);
}

export function getBddAutoInjectFixtures(bddContext: BddContext): BddAutoInjectFixtures {
  return {
    $testInfo: bddContext.testInfo,
    $tags: bddContext.tags,
    $test: bddContext.test,
    $step: bddContext.step,
    $bddContext: bddContext,
  };
}
