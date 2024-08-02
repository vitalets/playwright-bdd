import { test as setup, expect } from '@playwright/test';

setup('failing auth', async () => {
  expect(true).toBe(false);
});
