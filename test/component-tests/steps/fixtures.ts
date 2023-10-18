// TODO continue here
// import { test as base } from '@playwright/experimental-ct-react'
import { test as base } from 'playwright-bdd';

type Fixtures = {
  ctx: Record<string, string>;
};

export const test = base.extend<Fixtures>({
  ctx: ({}, use) => use({}),
});
