import { test as base } from '../../../dist';
import { TodoPage, TodoPage2 } from './TodoPage';

type Fixtures = {
  todoPage: TodoPage;
  todoPage2: TodoPage2;
};

export const test = base.extend<Fixtures>({
  todoPage: ({}, use) => use(new TodoPage()),
  todoPage2: ({}, use) => use(new TodoPage2()),
});
