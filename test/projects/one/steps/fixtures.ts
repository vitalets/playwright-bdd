import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ option: string; todoPage: TodoPage; usesBddFixtures: void }>({
  option: ['foo', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
  usesBddFixtures: [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ({ $tags }, use) => {
      await use();
    },
    { auto: true },
  ],
});
