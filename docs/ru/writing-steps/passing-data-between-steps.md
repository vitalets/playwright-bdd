# Передача данных между шагами

При написании BDD шагов вам часто нужно передавать данные от одного шага к другому.

Например, в одном шаге вы кликаете на ссылку, а в другом хотите проверить, что открылась новая вкладка:

```gherkin
Feature: home page

  Scenario: check link
    When I click the link
    Then new tab is opened
```

В Cucumber `world` используется как контейнер для таких данных. World создается для каждого сценария и сохраняется между всеми шагами. Один шаг может записать данные в объект `world`, а другой может прочитать из него.

В Playwright любая [фикстура с областью видимости теста](https://playwright.dev/docs/test-fixtures#creating-a-fixture) может использоваться как кросс-шаговый контекст. Вы можете назвать её `ctx` (для краткости) и инициализировать пустым объектом `{}`. Например:

```js
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  ctx: async ({}, use) => {
    const ctx = {};
    await use(ctx);
  },
});

export const { Given, When, Then } = createBdd(test);
```

Теперь вы можете использовать `ctx` в шагах для чтения и записи данных:

```js
import { Given, When, Then } from './fixtures';

When('I click the link', async ({ page, ctx }) => {
  ctx.newTapPromise = context.waitForEvent('page');
  await page.getByRole('link').click();
});

Then('new tab is opened', async ({ ctx }) => {
  const newTab = await ctx.newTapPromise;
  await expect(newTab).toHaveTitle(/.*checkout/);
});
```

?> Ознакомьтесь с примером [API тестирования](https://github.com/vitalets/playwright-bdd/tree/main/examples/api-testing) как демонстрацией передачи данных между шагами.

#### Для пользователей TypeScript

Вы можете определить тип `ctx` как `Record<string, any>` или сделать его более строгим:

```ts
type Ctx = {
  newTapPromise: Promise<Page>
};

export const test = base.extend<{ ctx: Ctx }>({
  ctx: async ({}, use) => {
    const ctx = {} as Ctx;
    await use(ctx);
  },
});

export const { Given, When, Then } = createBdd(test);
```

#### Стиль Cucumber
В шагах в стиле Cucumber используйте `this` для записи и чтения данных между шагами:

```js
import { Given, When, Then } from './fixtures';

When('I click the link', async function () {
  this.newTapPromise = this.context.waitForEvent('page');
  await this.page.getByRole('link').click();
});

Then('new tab is opened', async function () {
  const newTab = await this.newTapPromise;
  await expect(newTab).toHaveTitle(/.*checkout/);
});
```
