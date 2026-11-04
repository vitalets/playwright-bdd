// Compile-only checks for opt-in inference and preserved callable step signatures.
import { createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

const { Given } = createBdd(undefined, { bddExpr: true });
const callable = Given('typed :count{int}', ({ $step, page }, count: number) => {
  expectTypeOf($step.params.count).toEqualTypeOf<number>();
  expectTypeOf(page).toEqualTypeOf<import('@playwright/test').Page>();
  // @ts-expect-error Unknown named parameters are rejected when inference is enabled.
  expectTypeOf($step.params.missing);
  return count;
});
expectTypeOf(callable).parameter(1).toEqualTypeOf<number>();
// @ts-expect-error Positional callable arguments retain their types.
callable({}, 'wrong');

const runtimeFlag: boolean = Math.random() > 0.5;
createBdd(undefined, { bddExpr: runtimeFlag }).Given('dynamic :count{int}', ({ $step }) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
});
Given('dynamic step :count{int}', { bddExpr: runtimeFlag }, ({ $step }) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
});
Given('explicitly disabled :count{int}', { bddExpr: false }, ({ $step }) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
});
