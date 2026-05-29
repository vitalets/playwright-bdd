import { Given } from './fixtures';

Given('pw step no params, two args', async ({}, _foo: string) => {});
Given('pw step one param {int}, no args', async () => {});
Given('pw step one param {int}, one arg', async ({}) => {});
Given('pw step no params, no args for docstring', async () => {});
Given('pw step no params, one arg for docstring', async ({}) => {});
Given('pw step one param {int}, three args', async ({}, _value: number, _extra: string) => {});
Given(
  'pw step no params, three args for docstring',
  async ({}, _docString: string, _extra: string) => {},
);
// 0-arg empty step: fixtures object may be omitted when there are no captures
Given('pw step no params, no args', async () => {});
Given('pw step no params, one arg', async ({}) => {});
