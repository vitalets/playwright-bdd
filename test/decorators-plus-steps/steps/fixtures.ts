import { test as base } from 'playwright-bdd';
import { TodoPage, AdminTodoPage } from './TodoPage';

export const test = base.extend<{ todoPage: TodoPage; adminTodoPage: AdminTodoPage }>({
  todoPage: ({}, use) => use(new TodoPage()),
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
});
