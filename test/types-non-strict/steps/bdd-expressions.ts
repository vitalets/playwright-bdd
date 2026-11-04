import { createBdd, test as base, BddTestFixtures } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

createBdd(undefined, { bddExpr: true }).Given('value :count{int}', ({ $step }) => {
  expectTypeOf($step.params.count).toEqualTypeOf<number>();
});
createBdd().Given('value :count{int}', { bddExpr: true }, ({ $step }) => {
  expectTypeOf($step.params.count).toEqualTypeOf<number>();
});
createBdd(undefined, { bddExpr: true }).Given(
  'value :count{int}',
  { bddExpr: false },
  ({ $step }) => {
    expectTypeOf($step.params.count).toEqualTypeOf<undefined>();
  },
);

type World = { $step: BddTestFixtures['$step'] };
const test = base.extend<{ world: World }>({
  world: ({ $step }, use) => use({ $step }),
});
createBdd(test, { worldFixture: 'world', bddExpr: true }).Given('value :count{int}', function () {
  expectTypeOf(this.$step.params.count).toEqualTypeOf<number>();
});
createBdd(test, { worldFixture: 'world' }).Given(
  'value :count{int}',
  { bddExpr: true },
  function () {
    expectTypeOf(this.$step.params.count).toEqualTypeOf<number>();
  },
);
