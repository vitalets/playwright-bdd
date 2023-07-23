import { test as base } from '../../../dist/run/baseTest';
import { TodoPage, AdminTodoPage } from './TodoPage';

export const test = base.extend<{ todoPage: TodoPage; adminTodoPage: AdminTodoPage }>({
  todoPage: ({}, use) => use(new TodoPage()),
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
});
