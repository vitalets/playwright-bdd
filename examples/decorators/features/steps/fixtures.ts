import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage';
import { AdminTodoPage } from './AdminTodoPage';

type Fixtures = {
  todoPage: TodoPage;
  adminTodoPage: AdminTodoPage;
};

export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => use(new TodoPage(page)),
  adminTodoPage: async ({ page }, use) => use(new AdminTodoPage(page)),
});
