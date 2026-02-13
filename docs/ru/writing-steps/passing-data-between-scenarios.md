# Передача данных между сценариями

!> Обратите внимание, что последовательный режим **не рекомендуется** командой Playwright

При использовании [последовательного режима](https://playwright.dev/docs/test-parallel#serial-mode) Playwright вам может понадобиться передавать данные между сценариями внутри файла фичи.

Подход аналогичен [передаче данных между шагами](ru/writing-steps/passing-data-between-steps.md).
Вы создаете контекстную переменную, записываете в неё в одном сценарии и читаете в другом.
Единственное отличие в том, что контекстная переменная существует в глобальной области видимости и хранит отображение контекста на файл фичи.

Рассмотрим пример - совместное использование одного и того же экземпляра `page` между сценариями в файле. Вы можете залогинить пользователя в первом сценарии, а затем выполнить все проверки в последующих сценариях:

```gherkin
@mode:serial
Feature: My feature

  Scenario: Authenticate
    Given I am logged in as "user1"

  Scenario: Check profile
    # все еще на той же странице с тем же контекстом!
    When I open profile page
    Then I see name "user1"
```

#### Реализация
Реализация использует две фикстуры:

- `ctx` с областью видимости теста: хранит контекст для текущего файла
- `ctxMap` с областью видимости воркера: хранит карту всех контекстов и файлов в воркере

```ts
import { test as base, createBdd } from 'playwright-bdd';

// контекст, разделяемый между сценариями в файле
type Ctx = { page: Page };

export const test = base.extend<{ ctx: Ctx }, { ctxMap: Record<string, Ctx> }>({
  ctx: async ({ ctxMap }, use, testInfo) => {
    // получить или инициализировать контекст для текущего файла
    ctxMap[testInfo.file] = ctxMap[testInfo.file] || {};
    // передать контекст сценариям как фикстуру `ctx`
    await use(ctxMap[testInfo.file]);
  },
  ctxMap: [async ({}, use) => {
    const ctxMap: Record<string, Ctx> = {};
    await use(ctxMap);
    // очистить все контексты при завершении воркера
    for (const ctx of Object.values(ctxMap)) await ctx.page?.close();
  }, { scope: 'worker' }],
});

export const { Given, When, Then } = createBdd(test);
```

#### Использование
Теперь вы можете использовать фикстуру `ctx` в шагах, она будет сохраняться между сценариями:

```ts
import { Given, When, Then } from "./fixtures";

Given("I am logged in as {string}", async ({ ctx, browser }, user: string) => {
  ctx.page = await browser.newPage();
  // ...выполнить логин для пользователя
});

When("I open profile page", async ({ ctx }) => {
  await ctx.page.getByRole("link", { name: "Profile" }).click();
});

Then("I see name {string}", async ({ ctx }, user: string) => {
  await expect(ctx.page.getByRole("header")).toContainText(user);
});
```

Обратите внимание, что шаги не используют встроенную фикстуру `page` Playwright, так как она пересоздается для каждого сценария.
