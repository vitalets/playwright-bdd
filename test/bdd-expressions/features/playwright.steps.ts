import { createBdd, test as base } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';
import { transformations } from './custom-type.steps';

export const test = base.extend<{ value: number }>({ value: 42 });
const { Given: BddExprGiven, BeforeStep, AfterStep } = createBdd(test, { bddExpr: true });
const { Given } = createBdd(test);

BddExprGiven(
  'I have :count{int} items( for :owner)',
  ({ $step, value }, count: number, owner?: string) => {
    expectTypeOf($step.params).toEqualTypeOf<{ count: number; owner: string | undefined }>();
    expectTypeOf(value).toEqualTypeOf<number>();
    expect($step.params).toEqual({ count, owner });
    expect(value).toBe(42);
  },
);

BddExprGiven(
  'disabled BDD expressions :name is {int}',
  { bddExpr: false },
  ({ $step }, count: number) => {
    expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
    expect($step.params).toEqual({});
    expect(count).toBe(4);
  },
);

Given('BDD expressions disabled by default :name is {int}', ({ $step }, count: number) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
  expect($step.params).toEqual({});
  expect(count).toBe(5);
});

Given('local choice :color{red/green}', { bddExpr: true }, ({ $step }, color: string) => {
  expectTypeOf($step.params.color).toEqualTypeOf<'red' | 'green'>();
  expect($step.params.color).toBe(color);
});

BddExprGiven(/^regex number (\d+)$/, ({ $step }, value: number) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
  expect($step.params).toEqual({});
  expect(value).toBe(6);
});

BddExprGiven('custom price :price{price}', ({ $step }, price: number) => {
  expectTypeOf($step.params.price).toEqualTypeOf<unknown>();
  expect($step.params.price).toBe(14);
  expect(price).toBe(14);
  expect(transformations).toBe(1);
});

BddExprGiven('message :text', ({ $step }, text: string, docString: string) => {
  expectTypeOf($step.params.text).toEqualTypeOf<string>();
  expect($step.params.text).toBe(text);
  expect(docString).toBe('content');
});

BddExprGiven('mixed {int} and :label', ({ $step }, count: number, label: string) => {
  expectTypeOf($step.params).toEqualTypeOf<{ label: string }>();
  expect([count, label]).toEqual([8, 'label']);
  expect($step.params).toEqual({ label: 'label' });
});

BeforeStep(({ $step }) => {
  if ($step.title === 'I have 3 items for "Alice"') {
    expect($step.params).toEqual({ count: 3, owner: 'Alice' });
  }
});

AfterStep(({ $step }) => {
  if ($step.title === 'I have 2 items') {
    expect($step.params).toEqual({ count: 2, owner: undefined });
  }
});

BddExprGiven('step :count{int} with no positional params', ({ $step }) => {
  expect($step.params.count).toBe(3);
});
