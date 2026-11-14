// Compile-only checks for opt-in inference and preserved callable step signatures.
import { createBdd, DataTable } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

const { Given } = createBdd(undefined, { bddExpr: true });
// Named inference preserves fixtures and callable step signatures.
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

declare const runtimeFlag: boolean;
// An unknown default flag keeps inference conservative.
createBdd(undefined, { bddExpr: runtimeFlag }).Given('dynamic :count{int}', ({ $step }) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
  expectTypeOf($step.docString).toEqualTypeOf<string | undefined>();
  expectTypeOf($step.dataTable).toEqualTypeOf<DataTable | undefined>();
});

// Optional DataTable includes undefined.
Given('optional table(:table{DataTable})', ({ $step }) => {
  expectTypeOf($step.params.table).toEqualTypeOf<DataTable | undefined>();
  expectTypeOf($step.dataTable).toEqualTypeOf<DataTable | undefined>();
});

// Required DataTable preserves the concrete table type.
Given('required table{DataTable}', ({ $step }) => {
  expectTypeOf($step.dataTable.transpose()).toEqualTypeOf<DataTable>();
  expectTypeOf($step.docString).toEqualTypeOf<string | undefined>();
});

// Per-step opt-out leaves DocString optional.
Given('required doc{DocString}', { bddExpr: false }, ({ $step }) => {
  expectTypeOf($step.docString).toEqualTypeOf<string | undefined>();
});

const dynamicPattern: string = 'dynamic doc{DocString}';
// Dynamic patterns do not narrow DocString presence.
Given(dynamicPattern, ({ $step }) => {
  expectTypeOf($step.docString).toEqualTypeOf<string | undefined>();
});

// An unknown per-step flag disables named inference.
Given('dynamic step :count{int}', { bddExpr: runtimeFlag }, ({ $step }) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
});

// Explicit opt-out disables named inference.
Given('explicitly disabled :count{int}', { bddExpr: false }, ({ $step }) => {
  expectTypeOf($step.params).toEqualTypeOf<Record<string, unknown>>();
});
