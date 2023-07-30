import { test as base } from '../../dist';

class TodoPage {
  prop = '123';
  constructor() {}
}

class Account {
  constructor(public username: string, public password: string) {}
}

export const test = base.extend<{ option: string; todoPage: TodoPage }, { account: Account }>({
  option: ['foo', { option: true }],
  todoPage: async ({}, use) => {
    await use(new TodoPage());
  },
  account: [
    async ({}, use) => {
      await use(new Account('user', '123'));
    },
    { scope: 'worker' },
  ],
});
