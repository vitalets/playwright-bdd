import { test as base } from 'playwright-bdd';
import { Resource } from './steps-decorators';

export const test = base.extend<{ resource: Resource; world: object }>({
  resource: async ({}, use) => use(new Resource()),
  world: async ({}, use) => use({}),
});
