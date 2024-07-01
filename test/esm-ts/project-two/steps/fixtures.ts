import { test as base } from '../../steps/fixtures2.js';
import { AdminTodoPage } from './AdminTodoPage.js';

export const test = base.extend<{ anotherOption: string; adminTodoPage: AdminTodoPage }>({
  anotherOption: ['bar', { option: true }],
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
});
