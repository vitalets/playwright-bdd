/**
 * Auto-inject fixtures are automatically injected into every step call.
 */

import { TestInfo } from '@playwright/test';
import { BddFixtures } from './types';
import { BddWorld } from '../bddWorld';

// without explicitly passing them in the last argument of Given() / When() / Then()
export type BddAutoInjectFixtures = Pick<BddFixtures, '$test' | '$tags' | '$step'> & {
  $testInfo: TestInfo;
};

const BDD_AUTO_INJECT_FIXTURES: Record<keyof BddAutoInjectFixtures, null> = {
  $tags: null,
  $test: null,
  $step: null,
  $testInfo: null,
};

export function isBddAutoInjectFixture(name: string) {
  return Object.prototype.hasOwnProperty.call(
    BDD_AUTO_INJECT_FIXTURES,
    name as keyof BddAutoInjectFixtures,
  );
}

export function getBddAutoInjectFixtures(bddWorld: BddWorld): BddAutoInjectFixtures {
  return {
    $testInfo: bddWorld.testInfo,
    $tags: bddWorld.tags,
    $test: bddWorld.test,
    $step: bddWorld.step,
  };
}
