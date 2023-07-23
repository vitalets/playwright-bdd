import { test as base } from '../../steps/fixtures.js';

export const test = base.extend({
  anotherOption: ['bar', { option: true }],
});
