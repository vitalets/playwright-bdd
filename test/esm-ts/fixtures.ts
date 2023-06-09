/* eslint-disable @typescript-eslint/ban-ts-comment */
// important to import from playwright-bdd here (not ../../dist)
// @ts-ignore
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});
