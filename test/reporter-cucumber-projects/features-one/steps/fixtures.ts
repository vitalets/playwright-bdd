import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ option: string; todoPage: TodoPage; setProject: void }>({
  option: ['foo', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
});
