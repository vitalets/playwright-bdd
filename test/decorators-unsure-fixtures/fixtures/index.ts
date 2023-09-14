import { test as base } from '../../../dist';
import { TodoPage, AdminTodoPage, TodoPage2 } from './TodoPage';

type Fixtures = {
  todoPage: TodoPage;
  adminTodoPage: AdminTodoPage;
  todoPage2: TodoPage2;
};

export const test = base.extend<Fixtures>({
  todoPage: ({}, use) => use(new TodoPage()),
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
  todoPage2: ({}, use) => use(new TodoPage2()),
});
