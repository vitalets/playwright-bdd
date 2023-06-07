import { test as base } from '../../dist/run/baseTest';

export const test = base.extend({
  option: ['foo', { option: true }],
});
