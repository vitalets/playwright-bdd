import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('step with lock: lock1', { lock: 'lock1' }, () => {});
Given('step with locks: lock2, lock1, lock2', { lock: ['lock2', 'lock1', 'lock2'] }, () => {});
Given('step with lock: lock9', { lock: 'lock9' }, () => {});
Given('step with lock: lock10', { lock: 'lock10' }, () => {});
Given(
  ['first alias of a step with lock: lock5', 'second alias of a step with lock: lock5'],
  { lock: 'lock5' },
  () => {},
);
Given('scoped step with lock: lock6', { tags: '@foo', lock: 'lock6' }, () => {});
Given('scoped step with lock: lock6', { tags: 'not @foo', lock: 'lock7' }, () => {});
Given('step without a lock', () => {});
Given('step with an empty lock list', { lock: [] }, () => {});
Given(
  'step with quotes, a backslash, a template expression, and a newline in its lock name',
  { lock: ['single\' double" backtick` slash\\ dollar${name}\nline'] },
  () => {},
);
Given('step with lock: lock11 that skips at runtime', { lock: 'lock11' }, ({ $testInfo }) =>
  $testInfo.skip(),
);

const nested = Given('step with lock: lock12', { lock: 'lock12' }, () => {});
Given('step without a lock that calls a step with lock: lock12', () => nested());

Given('step with value {int}', ({}, _value: number) => {});
