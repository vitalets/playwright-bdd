import { test as base } from 'playwright-bdd';
import { TodoPage } from './poms';

export const test = base.extend({
  todoPage: ({}, use) => use(new TodoPage()),
});
