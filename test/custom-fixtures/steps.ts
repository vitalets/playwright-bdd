import { Then } from './fixtures';

Then('Get custom fixtures and arg {string}', async ({ page, todoPage }, arg: string) => {
  return { page, todoPage, arg };
});
