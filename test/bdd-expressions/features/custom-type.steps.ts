import { defineParameterType } from 'playwright-bdd';
import { expect } from '@playwright/test';

export let transformations = 0;

defineParameterType({
  name: 'price',
  regexp: /\d+/,
  async transformer(value: string) {
    expect(typeof this).toBe('object');
    transformations++;
    return Number(value) * 2;
  },
});
