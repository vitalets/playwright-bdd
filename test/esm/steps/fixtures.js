// not just ../../../dist b/c file extension is required in ESM
// (otherwise ERR_UNSUPPORTED_DIR_IMPORT)
import { test as base } from '../../../dist/index.js';
import { TodoPage } from './TodoPage.js';

export const test = base.extend({
  someOption: ['foo', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
});
