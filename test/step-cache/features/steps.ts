import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { testWithLog } from '../../_helpers/withLog';
import { trackMatchCalls } from './track-match-calls';

export const test = testWithLog;

const { Given } = createBdd(test);

trackMatchCalls();

Given('I open the catalog', ({}) => {});
Given(/^I close the catalog$/, ({}) => {});

Given('I read a payload:body{DocString}', { bddExpr: true }, ({ log }, body) => {
  log(`Given I read a payload (DocString ${JSON.stringify(body)})`);
});

Given('I read a payload:table{DataTable}', { bddExpr: true }, ({ log }, table) => {
  log(`Given I read a payload (DataTable ${JSON.stringify(table.raw())})`);
});

Given('true:false:collision', ({}) => {});
Given('collision:body{DocString}', { bddExpr: true }, ({}, body) => {
  expect(body).toBe('hello');
});

Given('I choose an item', ({}) => {});
Given(/^I choose an item$/, ({}) => {});
Given('I choose an item', { tags: '@special' }, ({}) => {});
