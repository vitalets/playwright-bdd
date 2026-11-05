import { Given } from './fixtures';
import { DataTable } from 'playwright-bdd';
import { expect } from '@playwright/test';

Given(
  'pw step with no captures and an optional doc string parameter',
  async ({}, _foo: string) => {},
);
Given('pw step {int} with no parameters', async () => {});
Given('pw step {int} with fixtures only', async ({}) => {});
Given('pw doc string step with no parameters', async () => {});
Given('pw doc string step with fixtures only', async ({}) => {});
Given(
  'pw step {int} with excess parameters',
  async ({}, _value: number, _docString: string, _extra: string) => {},
);
Given(
  'pw doc string step with excess parameters',
  async ({}, _docString: string, _extra: string) => {},
);
// 0-arg empty step: fixtures object may be omitted when there are no captures
Given('pw step with no captures and no parameters', async () => {});
Given('pw step with no captures and fixtures only', async ({}) => {});
Given(
  'pw step {int} with excess parameters and arity check disabled',
  { arityCheck: false },
  async ({}, _value: number, _docString: string, _extra: string) => {},
);

Given(
  'step with an optional doc string or data table parameter',
  ({}, docString?: string | DataTable) => {
    expect(docString === undefined || docString === 'hello' || docString instanceof DataTable).toBe(
      true,
    );
  },
);
Given('step {int} with a default parameter', ({}, count = 0) => expect(count).toBe(3));
Given('step {int} with rest parameters', ({}, ...counts: number[]) => expect(counts).toEqual([3]));
Given('step reading a doc string through $step only', ({ $step }) =>
  expect($step.docString).toBe('hello'),
);
Given('step reading a data table through $step only', ({ $step }) =>
  expect($step.dataTable?.raw()).toEqual([['hello']]),
);
Given(
  'step with excess parameters and arity check explicitly enabled',
  { arityCheck: true },
  ({}, _docString: string, _extra: string) => {},
);
