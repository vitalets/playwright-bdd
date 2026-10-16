import type { TestStepInfo } from '@playwright/test';
import type { BddTestFixtures } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

// This suite only compiles: verify the public fixture follows the consumer's native types.
declare const step: BddTestFixtures['$step'];
expectTypeOf(step.info).toEqualTypeOf<Omit<TestStepInfo, 'skip'>>();
expectTypeOf(step.attach).toEqualTypeOf<TestStepInfo['attach']>();
expectTypeOf(step.skip).toEqualTypeOf<TestStepInfo['skip']>();
step.attach('text', { body: 'text' });
step.info.attach('text');
step.skip();
step.skip(false, 'reason');
// @ts-expect-error Use the BDD-aware skip method.
step.info.skip();
// @ts-expect-error Native info cannot be replaced by consumers.
step.info = {};
// @ts-expect-error Hooks can inspect the body failure, but cannot replace it.
step.error = undefined;

// The public subset must not expose internal lifecycle or skip-tracking state.
expectTypeOf<keyof BddTestFixtures['$step']>().toEqualTypeOf<
  'title' | 'docStringType' | 'error' | 'info' | 'attach' | 'skip'
>();

expectTypeOf<BddTestFixtures['$bddContext']['step']>().toEqualTypeOf<BddTestFixtures['$step']>();
