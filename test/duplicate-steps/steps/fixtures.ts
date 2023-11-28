import { test as base } from '../../../dist';
import { TodoPage } from './TodoPage';

type Fixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<Fixtures>({
  todoPage: ({}, use) => use(new TodoPage()),
});
