// important to import from playwright-bdd here (not ../../dist)
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  foo: ['bar', { option: true }],
});
