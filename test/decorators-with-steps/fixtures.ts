import { test as base } from '../../dist/run/baseTest';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: ({}, use) => use(new TodoPage()),
});
