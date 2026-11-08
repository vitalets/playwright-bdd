import { DataTable, createBdd, test as base, BddTestFixtures } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';
import { transformations } from './custom-type.steps';

type World = { $step: BddTestFixtures['$step']; value: number };
export const test = base.extend<{ world: World }>({
  world: ({ $step }, use) => use({ $step, value: 42 }),
});
const { Given: BddExprGiven } = createBdd(test, { worldFixture: 'world', bddExpr: true });
const { Given } = createBdd(test, { worldFixture: 'world' });

// Required and optional named parameters.
BddExprGiven('I have :count{int} items( for :owner)', function (count: number, owner?: string) {
  expectTypeOf(this.$step.params).toEqualTypeOf<{ count: number; owner: string | undefined }>();
  expect(this.$step.params).toEqual({ count, owner });
  expect(this.value).toBe(42);
});

// Per-step opt-out overrides the BDD default.
BddExprGiven(
  'disabled BDD expressions :name is {int}',
  { bddExpr: false },
  function (count: number) {
    expectTypeOf(this).toEqualTypeOf<World>();
    expect(this.$step.params).toEqual({});
    expect(count).toBe(4);
  },
);

// Cucumber expressions by default.
Given('BDD expressions disabled by default :name is {int}', function (count: number) {
  expect(this.$step.params).toEqual({});
  expect(count).toBe(5);
});

// Per-step opt-in with inferred inline choices.
Given('local choice :color{red/green}', { bddExpr: true }, function (color: string) {
  expectTypeOf(this.$step.params.color).toEqualTypeOf<'red' | 'green'>();
  expect(this.$step.params.color).toBe(color);
});

// RegExp patterns ignore the BDD expression flag.
BddExprGiven(/^regex number (\d+)$/, function (value: number) {
  expectTypeOf(this).toEqualTypeOf<World>();
  expect(this.$step.params).toEqual({});
  expect(value).toBe(6);
});

// Custom transformer runs once for positional and named values.
BddExprGiven('custom price :price{price}', function (price: number) {
  expect(this.$step.params.price).toBe(14);
  expect(price).toBe(14);
  expect(transformations).toBe(1);
});

// DocString remains available without an explicit parameter.
BddExprGiven('message :text', function (text: string, docString: string) {
  expectTypeOf(this.$step.params.text).toEqualTypeOf<string>();
  expect(this.$step.params.text).toBe(text);
  expect(docString).toBe('content');
});

// Named and unnamed parameters preserve positional order.
BddExprGiven('mixed {int} and :label', function (count: number, label: string) {
  expectTypeOf(this.$step.params).toEqualTypeOf<{ label: string }>();
  expect([count, label]).toEqual([8, 'label']);
  expect(this.$step.params).toEqual({ label: 'label' });
});

// Named values work without positional callback arguments.
BddExprGiven('step :count{int} with no positional params', function () {
  expect(this.$step.params.count).toBe(3);
});

// Named required DocString.
BddExprGiven('payload:body{DocString}', function (body: string, ...extra: unknown[]) {
  expectTypeOf(this.$step.docString).toEqualTypeOf<string>();
  expectTypeOf(this.$step.params.body).toEqualTypeOf<string>();
  expect(this.$step.params.body).toBe(body);
  expect(this.$step.docString).toBe(body);
  expect(extra).toEqual([]);
});

// Named required DataTable.
BddExprGiven('payload:table{DataTable}', function (table: DataTable, ...extra: unknown[]) {
  expectTypeOf(this.$step.dataTable).toEqualTypeOf<DataTable>();
  expectTypeOf(this.$step.params.table).toEqualTypeOf<DataTable>();
  expect(this.$step.params.table).toBe(table);
  expect(this.$step.dataTable).toBe(table);
  expect(table.hashes()).toEqual([{ name: 'Alice' }]);
  expect(extra).toEqual([]);
});

// Named optional DocString with a matching optional colon.
BddExprGiven('optional payload(::body{DocString})', function (body?: string, ...extra: unknown[]) {
  expectTypeOf(this.$step.docString).toEqualTypeOf<string | undefined>();
  expectTypeOf(this.$step.params.body).toEqualTypeOf<string | undefined>();
  expect(this.$step.params.body).toBe(body);
  expect(this.$step.docString).toBe(body);
  expect(extra).toEqual([]);
});

// DocString or DataTable, with undefined for the unused slot.
BddExprGiven(
  'alternative payload[:body{DocString}/:table{DataTable}]',
  function (body?: string, table?: DataTable, ...extra: unknown[]) {
    expectTypeOf(this.$step.docString).toEqualTypeOf<string | undefined>();
    expectTypeOf(this.$step.dataTable).toEqualTypeOf<DataTable | undefined>();
    expect(this.$step.params).toEqual({ body, table });
    expect(this.$step.docString).toBe(body);
    expect(this.$step.dataTable).toBe(table);
    expect(extra).toEqual([]);
  },
);

// Unnamed required DocString accepts an empty string.
BddExprGiven('unnamed payload{DocString}', function (body: string, ...extra: unknown[]) {
  expectTypeOf(this.$step.docString).toEqualTypeOf<string>();
  expect(this.$step.params).toEqual({});
  expect(body).toBe('');
  expect(extra).toEqual([]);
});

// DataTable remains available without an explicit parameter.
BddExprGiven(
  'table without an explicit parameter',
  function (table: DataTable, ...extra: unknown[]) {
    expectTypeOf(this.$step.dataTable).toEqualTypeOf<DataTable | undefined>();
    expect(this.$step.dataTable).toBe(table);
    expect(table.raw()).toEqual([['value']]);
    expect(extra).toEqual([]);
  },
);

// Declared DocString does not allow an extra callback argument.
BddExprGiven('excess argument{DocString}', function (_body: string, _extra: string) {});

// Permissive definition also matches a step with a DocString.
BddExprGiven('ambiguous payload', function () {});

// Required DocString does not take priority over a permissive definition.
BddExprGiven('ambiguous payload{DocString}', function () {});

// Named optional DataTable with a matching optional colon.
BddExprGiven(
  'optional table(::table{DataTable})',
  function (table?: DataTable, ...extra: unknown[]) {
    expectTypeOf(this.$step.dataTable).toEqualTypeOf<DataTable | undefined>();
    expectTypeOf(this.$step.params.table).toEqualTypeOf<DataTable | undefined>();
    expect(this.$step.params.table).toBe(table);
    expect(this.$step.dataTable).toBe(table);
    expect(extra).toEqual([]);
  },
);
