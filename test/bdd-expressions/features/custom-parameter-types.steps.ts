import { createBdd, defineParameterType } from 'playwright-bdd';
import { expect } from '@playwright/test';

defineParameterType({ name: 'DocString', regexp: /value/, transformer: (value: string) => value });
defineParameterType({ name: 'DataTable', regexp: /value/, transformer: (value: string) => value });

const { Given } = createBdd(undefined, { bddExpr: true });

// Cucumber expressions retain a custom DocString text type.
Given('Cucumber doc {DocString}', { bddExpr: false }, ({}, value: string) => {
  expect(value).toBe('value');
});

// Cucumber expressions retain a custom DataTable text type.
Given('Cucumber table {DataTable}', { bddExpr: false }, ({}, value: string) => {
  expect(value).toBe('value');
});

// Custom DocString text type takes precedence in BDD expressions.
Given('BDD doc {DocString}', ({ $step }, value: string) => {
  expect(value).toBe('value');
  expect($step.docString).toBeUndefined();
});

// Custom DataTable text type takes precedence in BDD expressions.
Given('BDD table {DataTable}', ({ $step }, value: string) => {
  expect(value).toBe('value');
  expect($step.dataTable).toBeUndefined();
});
