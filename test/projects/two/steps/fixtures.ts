import { test as base } from '../../one/steps/fixtures';
import { AdminTodoPage } from './AdminTodoPage';

export const test = base.extend<{ secondOption: string; adminTodoPage: AdminTodoPage }>({
  secondOption: ['bar', { option: true }],
  adminTodoPage: ({}, use) => use(new AdminTodoPage()),
});
