import { createBdd, test as base, BddTestFixtures } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';
import { transformations } from './custom-type.steps';

type World = { $step: BddTestFixtures['$step']; value: number };
export const test = base.extend<{ world: World }>({
  world: ({ $step }, use) => use({ $step, value: 42 }),
});
const { Given: BddExprGiven } = createBdd(test, { worldFixture: 'world', bddExpr: true });
const { Given } = createBdd(test, { worldFixture: 'world' });

BddExprGiven('I have :count{int} items( for :owner)', function (count: number, owner?: string) {
  expectTypeOf(this.$step.params).toEqualTypeOf<{ count: number; owner: string | undefined }>();
  expect(this.$step.params).toEqual({ count, owner });
  expect(this.value).toBe(42);
});

BddExprGiven(
  'disabled BDD expressions :name is {int}',
  { bddExpr: false },
  function (count: number) {
    expectTypeOf(this).toEqualTypeOf<World>();
    expect(this.$step.params).toEqual({});
    expect(count).toBe(4);
  },
);

Given('BDD expressions disabled by default :name is {int}', function (count: number) {
  expect(this.$step.params).toEqual({});
  expect(count).toBe(5);
});

Given('local choice :color{red/green}', { bddExpr: true }, function (color: string) {
  expectTypeOf(this.$step.params.color).toEqualTypeOf<'red' | 'green'>();
  expect(this.$step.params.color).toBe(color);
});

BddExprGiven(/^regex number (\d+)$/, function (value: number) {
  expectTypeOf(this).toEqualTypeOf<World>();
  expect(this.$step.params).toEqual({});
  expect(value).toBe(6);
});

BddExprGiven('custom price :price{price}', function (price: number) {
  expect(this.$step.params.price).toBe(14);
  expect(price).toBe(14);
  expect(transformations).toBe(1);
});

BddExprGiven('message :text', function (text: string, docString: string) {
  expectTypeOf(this.$step.params.text).toEqualTypeOf<string>();
  expect(this.$step.params.text).toBe(text);
  expect(docString).toBe('content');
});

BddExprGiven('mixed {int} and :label', function (count: number, label: string) {
  expectTypeOf(this.$step.params).toEqualTypeOf<{ label: string }>();
  expect([count, label]).toEqual([8, 'label']);
  expect(this.$step.params).toEqual({ label: 'label' });
});
