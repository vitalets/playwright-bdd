import { test as base } from '../../../dist';
import { TodoPage, TodoPage2, AdminTodoPage, TodoPageOnlyFixture } from './TodoPage';

type Fixtures = {
  todoPage: TodoPage;
  todoPage2: TodoPage2;
  todoPageOnlyFixture: TodoPageOnlyFixture;
  adminTodoPage: AdminTodoPage;
};

export const test = base.extend<Fixtures>({
  todoPage: ({}, use) => use(new TodoPage()),
  todoPage2: ({}, use) => use(new TodoPage2()),
  todoPageOnlyFixture: ({}, use) => use(new TodoPageOnlyFixture()),
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
});
