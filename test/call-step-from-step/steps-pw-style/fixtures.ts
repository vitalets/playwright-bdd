import { test as base } from 'playwright-bdd';

export const test = base.extend<{ todos: string[] }>({
  todos: ({}, use) => use([]),
});
