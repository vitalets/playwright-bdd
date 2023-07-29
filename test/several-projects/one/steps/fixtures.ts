import { test as base } from '../../../../dist';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ option: string; todoPage: TodoPage }>({
  option: ['foo', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
});
