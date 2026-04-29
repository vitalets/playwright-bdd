import { Given } from './fixtures';

Given('pw step with missing args {int}', async ({}) => {});
Given('pw doc step with missing args', async ({}) => {});
Given('pw step with too many args {int}', async ({}, _value: number, _extra: string) => {});
Given('pw doc step with too many args', async ({}, _docString: string, _extra: string) => {});
