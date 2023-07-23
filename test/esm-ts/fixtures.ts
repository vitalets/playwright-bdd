/* eslint-disable @typescript-eslint/ban-ts-comment */
// important to import from playwright-bdd here (not ../../dist)
// @ts-ignore
import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage.js';

export const test = base.extend<{ someOption: string; todoPage: TodoPage }>({
  someOption: ['foo', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
});
