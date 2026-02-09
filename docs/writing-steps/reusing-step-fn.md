# Re-using step function

It is possible to re-use a step function in other steps to share common functionality. Save the return value of `Given() / When() / Then()` and invoke it in other steps. Note that you should pass all required fixtures in the first argument.

> **Tip:** It's useful to add JSDoc comments with exact parameter types to your reusable step functions. This provides better IntelliSense and type hints when calling the step function in other steps.

Example:
```ts
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

/**
 * Creates a todo item with the given text.
 * 
 * @param {Object} fixtures - The test fixtures
 * @param {import('@playwright/test').Page} fixtures.page - Playwright page object
 * @param {string} text - The text content for the todo item
 */
const createTodo = When('I create todo {string}', async ({ page }, text: string) => {
  await page.getByLabel('title').fill(text);
  await page.getByRole('button').click();
});

When('I create 2 todos {string} and {string}', async ({ page }, text1: string, text2: string) => {
  await createTodo({ page }, text1);
  await createTodo({ page }, text2);
});
```

#### Passing World

For **cucumber-style steps**, you should invoke the step function via `.call()` to pass the actual World:

```js
/**
 * Creates a todo item with the given text.
 * 
 * @this {World}
 * @param {string} text - The text content for the todo item
 */
const createTodo = When('I create todo {string}', async function (text: string) {
  await this.page.getByLabel('title').fill(text);
  await this.page.getByRole('button').click();
});

When('I create 2 todos {string} and {string}', async function (text1: string, text2: string) {
  await createTodo.call(this, text1);
  await createTodo.call(this, text2);
});
```
