// important to import from playwright-bdd here (not ../../dist)
import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage.js';

export const test = base.extend({
  someOption: ['foo', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
});
