import { default as base } from './fixtures1.js';
import { TodoPage } from './TodoPage.js';

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: ({}, use) => use(new TodoPage()),
});
