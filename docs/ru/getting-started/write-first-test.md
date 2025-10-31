# Напишите свой первый BDD тест

Следуйте шагам ниже, чтобы создать и запустить ваш первый BDD тест с Playwright-BDD.

?> Это руководство использует JavaScript для простоты, но вы можете использовать TypeScript также.

### Шаг 1: Создайте файл конфигурации

Создайте следующий `playwright.config.js` в корне проекта:

```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'sample.feature',
  steps: 'steps.js',
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
```

### Шаг 2: Создайте файл фичи

Создайте файл фичи с именем `sample.feature`:

```gherkin
Feature: Playwright site

    Scenario: Check get started link
        Given I am on home page
        When I click link "Get started"
        Then I see in title "Installation"
```

### Шаг 3: Реализуйте шаги

Реализуйте шаги в `steps.js`:

```ts
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I am on home page', async ({ page }) => {
  await page.goto('https://playwright.dev');
});

When('I click link {string}', async ({ page }, name) => {
  await page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async ({ page }, keyword) => {
  await expect(page).toHaveTitle(new RegExp(keyword));
});
```

> Существуют альтернативные способы определения шагов: [Декораторы](ru/writing-steps/decorators.md) и [синтаксис в стиле Cucumber](ru/writing-steps/cucumber-style.md).

### Шаг 4: Запустите тесты

Сгенерируйте и запустите тесты:

```
npx bddgen && npx playwright test
```

Команда для **Yarn**
```
yarn bddgen && yarn playwright test
```

Команда для **pnpm**:
```
pnpm bddgen && pnpm playwright test
```

Вывод:

```
Running 1 test using 1 worker
1 passed (2.0s)

To open the last HTML report, run:

npx playwright show-report
```

HTML отчет:

![Playwright HTML report](./../../getting-started/_media/playwright-report.png ':size=70%')

### Шаг 5: Проверьте сгенерированные тесты (опционально)

Проверьте директорию `.features-gen`, чтобы увидеть, как выглядят сгенерированные тесты.
Вы увидите что-то вроде этого:

```js
// Generated from: sample.feature
import { test } from 'playwright-bdd';

test.describe('Playwright site', () => {

  test('Check get started link', async ({ Given, When, Then }) => {
    await Given('I am on home page');
    await When('I click link "Get started"');
    await Then('I see in title "Installation"');
  });

});
```

?> Вот полностью рабочий пример проекта Playwright-BDD: [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example).

> Не забудьте [игнорировать сгенерированные файлы в git](ru/guides/ignore-generated-files.md).

!> Если ваш проект использует [ES Modules](https://nodejs.org/api/esm.html), пожалуйста, ознакомьтесь с [конфигурацией ESM](ru/configuration/esm.md).


