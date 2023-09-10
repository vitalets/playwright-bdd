import { test as base } from '../../../dist';
import { TodoPage, AdminTodoPage, TodoPageOnlyFixture } from './TodoPage';
import { TodoPage2, AdminTodoPage2 } from './TodoPage2';

type Fixtures = {
  todoPage: TodoPage;
  todoPage2: TodoPage2;
  todoPageOnlyFixture: TodoPageOnlyFixture;
  adminTodoPage: AdminTodoPage;
  adminTodoPage2: AdminTodoPage2;
};

export const test = base.extend<Fixtures>({
  todoPage: ({}, use) => use(new TodoPage()),
  todoPage2: ({}, use) => use(new TodoPage2()),
  todoPageOnlyFixture: ({}, use) => use(new TodoPageOnlyFixture()),
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
  adminTodoPage2: ({}, use) => use(new AdminTodoPage2()),
});
