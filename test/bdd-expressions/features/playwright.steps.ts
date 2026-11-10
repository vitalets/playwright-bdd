import { DataTable, createBdd, test as base } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';
import { transformations } from './custom-type.steps';

export const test = base.extend<{ value: number }>({ value: 42 });
const { Given: BddExprGiven, BeforeStep, AfterStep } = createBdd(test, { bddExpr: true });
const { Given } = createBdd(test);

// Required and optional named parameters.
BddExprGiven('I have :count{int} items( for :owner)', ({ $step, value }, count, owner) => {
  expectTypeOf(count).toEqualTypeOf<number>();
  expectTypeOf(owner).toEqualTypeOf<string | undefined>();
  expectTypeOf($step.params).toEqualTypeOf<{ count: number; owner: string | undefined }>();
  expectTypeOf(value).toEqualTypeOf<number>();
  expect($step.params).toEqual({ count, owner });
  expect(value).toBe(42);
});

// Per-step opt-out overrides the BDD default.
BddExprGiven(
  'disabled BDD expressions :name is {int}',
  { bddExpr: false },
  ({ $step }, count: number) => {
    expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
    expect($step.params).toEqual({});
    expect(count).toBe(4);
  },
);

// Cucumber expressions by default.
Given('BDD expressions disabled by default :name is {int}', ({ $step }, count: number) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
  expect($step.params).toEqual({});
  expect(count).toBe(5);
});

// Per-step opt-in with inferred inline choices.
Given('local choice :color{red/green}', { bddExpr: true }, ({ $step }, color) => {
  expectTypeOf(color).toEqualTypeOf<'red' | 'green'>();
  expectTypeOf($step.params.color).toEqualTypeOf<'red' | 'green'>();
  expect($step.params.color).toBe(color);
});

// RegExp patterns ignore the BDD expression flag.
BddExprGiven(/^regex number (\d+)$/, ({ $step }, value: number) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
  expect($step.params).toEqual({});
  expect(value).toBe(6);
});

// Custom transformer runs once for positional and named values.
BddExprGiven('custom price :price{price}', ({ $step }, price: number) => {
  expectTypeOf($step.params.price).toEqualTypeOf<unknown>();
  expect($step.params.price).toBe(14);
  expect(price).toBe(14);
  expect(transformations).toBe(1);
});

// DocString remains available without an explicit parameter.
BddExprGiven('message :text', ({ $step }, text: string, docString: string) => {
  expectTypeOf($step.params.text).toEqualTypeOf<string>();
  expect($step.params.text).toBe(text);
  expect(docString).toBe('content');
});

// Named and unnamed parameters preserve positional order.
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

// Named values work without positional callback arguments.
BddExprGiven('step :count{int} with no positional params', ({ $step }) => {
  expect($step.params.count).toBe(3);
});

// Named required DocString.
BddExprGiven('payload:body{DocString}', function ({ $step }, body, ...extra: unknown[]) {
  expectTypeOf(body).toEqualTypeOf<string>();
  expectTypeOf($step.docString).toEqualTypeOf<string>();
  expectTypeOf($step.params.body).toEqualTypeOf<string>();
  expect($step.params.body).toBe(body);
  expect($step.docString).toBe(body);
  expect(extra).toEqual([]);
});

// Named required DataTable.
BddExprGiven('payload:table{DataTable}', function ({ $step }, table, ...extra: unknown[]) {
  expectTypeOf(table).toEqualTypeOf<DataTable>();
  expectTypeOf($step.dataTable).toEqualTypeOf<DataTable>();
  expectTypeOf($step.params.table).toEqualTypeOf<DataTable>();
  expect($step.params.table).toBe(table);
  expect($step.dataTable).toBe(table);
  expect(table.hashes()).toEqual([{ name: 'Alice' }]);
  expect(extra).toEqual([]);
});

// Named optional DocString with a matching optional colon.
BddExprGiven(
  'optional payload(::body{DocString})',
  function ({ $step }, body?: string, ...extra: unknown[]) {
    expectTypeOf($step.docString).toEqualTypeOf<string | undefined>();
    expectTypeOf($step.params.body).toEqualTypeOf<string | undefined>();
    expect($step.params.body).toBe(body);
    expect($step.docString).toBe(body);
    expect(extra).toEqual([]);
  },
);

// DocString or DataTable, with undefined for the unused slot.
BddExprGiven(
  'alternative payload[:body{DocString}/:table{DataTable}]',
  function ({ $step }, body?: string, table?: DataTable, ...extra: unknown[]) {
    expectTypeOf($step.docString).toEqualTypeOf<string | undefined>();
    expectTypeOf($step.dataTable).toEqualTypeOf<DataTable | undefined>();
    expect($step.params).toEqual({ body, table });
    expect($step.docString).toBe(body);
    expect($step.dataTable).toBe(table);
    expect(extra).toEqual([]);
  },
);

// Unnamed required DocString accepts an empty string.
BddExprGiven('unnamed payload{DocString}', function ({ $step }, body, ...extra: unknown[]) {
  expectTypeOf(body).toEqualTypeOf<string>();
  expectTypeOf($step.docString).toEqualTypeOf<string>();
  expect($step.params).toEqual({});
  expect(body).toBe('');
  expect(extra).toEqual([]);
});

// DataTable remains available without an explicit parameter.
BddExprGiven(
  'table without an explicit parameter',
  function ({ $step }, table: DataTable, ...extra: unknown[]) {
    expectTypeOf($step.dataTable).toEqualTypeOf<DataTable | undefined>();
    expect($step.dataTable).toBe(table);
    expect(table.raw()).toEqual([['value']]);
    expect(extra).toEqual([]);
  },
);

// Declared DocString does not allow an extra callback argument.
BddExprGiven('excess argument{DocString}', function ({}, _body: string, _extra: string) {});

// Permissive definition also matches a step with a DocString.
BddExprGiven('ambiguous payload', function ({}) {});

// Required DocString does not take priority over a permissive definition.
BddExprGiven('ambiguous payload{DocString}', function ({}) {});

// Named optional DataTable with a matching optional colon.
BddExprGiven(
  'optional table(::table{DataTable})',
  function ({ $step }, table?: DataTable, ...extra: unknown[]) {
    expectTypeOf($step.dataTable).toEqualTypeOf<DataTable | undefined>();
    expectTypeOf($step.params.table).toEqualTypeOf<DataTable | undefined>();
    expect($step.params.table).toBe(table);
    expect($step.dataTable).toBe(table);
    expect(extra).toEqual([]);
  },
);

// Additional positional type checks use patterns distinct from runtime scenarios.
const runtimeFlag = Boolean(process.env.BDD_EXPR_TYPECHECK);
const dynamicPattern: string = 'typecheck dynamic pattern count {int}';
type Color = 'red' | 'blue' | 'yellow';

// Reusable step functions preserve their positional argument and return types.
const reusableStepFn = BddExprGiven(
  'typecheck reusable count {int}',
  { tags: '@typecheck' },
  ({}, count) => count,
);
expectTypeOf(reusableStepFn).parameter(1).toEqualTypeOf<number>();
expectTypeOf(reusableStepFn).returns.toEqualTypeOf<unknown>();

BddExprGiven(
  'typecheck incompatible count {int}',
  // @ts-expect-error Built-in slots reject incompatible annotations on the callback.
  ({}, _count: string) => {},
);
BddExprGiven(
  'typecheck custom :price{price} count {int}',
  // @ts-expect-error Known slots are checked alongside custom types.
  ({}, _price: number, _count: string) => {},
);
// @ts-expect-error Optional captures can produce undefined.
BddExprGiven('typecheck optional count( {int})', ({}, _count: number) => {});
// @ts-expect-error Callbacks must accept every choice.
BddExprGiven('typecheck narrow choice {red/blue}', ({}, _color: 'red') => {});
// @ts-expect-error String captures must accept any string.
BddExprGiven('typecheck narrow string {string}', ({}, _color: Color) => {});
// @ts-expect-error Rest arguments must accept the captured type.
BddExprGiven('typecheck incompatible rest {int}', ({}, ..._args: string[]) => {});
// @ts-expect-error Explicit DataTable slots use the concrete type.
BddExprGiven('typecheck incompatible table{DataTable}', ({}, _table: string) => {});
BddExprGiven('typecheck ignored trailing {int} for :owner', ({}, _count: number) => {});
BddExprGiven('typecheck compatible rest {int}', ({}, ..._args: number[]) => {});
BddExprGiven('typecheck disabled count {int}', { bddExpr: false }, ({}, _count: string) => {});
// A boolean flag may be false at runtime, so positional validation is disabled and string is accepted.
BddExprGiven(
  'typecheck dynamic flag count {int}',
  { bddExpr: runtimeFlag },
  ({}, _count: string) => {},
);
// A widened string pattern has no known parameter slots, so string is accepted despite the runtime {int}.
BddExprGiven(dynamicPattern, ({}, _count: string) => {});
Given(
  'typecheck enabled count {int}',
  { bddExpr: true },
  // @ts-expect-error Per-step opt-in reports incompatible arguments on the callback.
  ({}, _count: string) => {},
);
