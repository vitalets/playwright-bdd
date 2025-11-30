# Фикстуры Playwright-BDD
Playwright-BDD предоставляет встроенные фикстуры для удобной разработки.

?> Все BDD фикстуры имеют префикс `$`, чтобы избежать коллизии имен с пользовательскими фикстурами.

> См. также [Доступ к BDD фикстурам в шагах-декораторах](ru/writing-steps/decorators.md#accessing-bdd-fixtures).

## `$test` и `$testInfo`<a id="test-and-testinfo"></a>
Вы можете получить доступ к [`test`](https://playwright.dev/docs/api/class-test) и [`testInfo`](https://playwright.dev/docs/api/class-testinfo) в теле шага, используя специальные фикстуры `$test` и `$testInfo` соответственно. Это позволяет вам:

  * изменять таймаут теста
  * условно пропускать тесты
  * прикреплять скриншоты
  * выполнять все другие действия через объект `testInfo`

Пример - пропустить тест для `firefox`:
```ts
Given('I do something', async ({ browserName, $test }) => {
  if (browserName === 'firefox') $test.skip();
  // ...
});
```

## `$step`
Вы можете получить доступ к информации о текущем шаге, используя специальную фикстуру `$step`.
В настоящее время она содержит только заголовок шага, но может быть расширена в будущем.

```ts
Given('I open url {string}', async ({ $step }, url: string) => {
  console.log($step.title); // I open url "https://playwright.dev"
  // ...
});
```

#### Пример
Популярный случай использования фикстуры `$step` - это дополнительное сопоставление по заголовку шага.

Представьте, что у вас есть универсальный шаг для проверки того, виден элемент или скрыт:
```ts
Then('element with text {string} should( not) be displayed', ...)
```
Паттерн содержит опциональное сопоставление `should( not)`, которое [недоступно](https://github.com/cucumber/cucumber-expressions/issues/125) внутри функции шага. Самый простой способ дополнительно проверить `( not)` - использовать заголовок шага:
```ts
Then('element with text {string} should( not) be displayed', async ({ page, $step }, text: string) => {
  const negate = /should not/.test($step.title);
  if (negate) {
    await expect(page.getByText(text)).toBeHidden();
  } else {
    await expect(page.getByText(text)).toBeVisible();
  }
});
```

## `$tags`
Вы можете получить доступ к текущим тегам теста, используя специальную фикстуру `$tags`:

```gherkin
@slow
Feature: Playwright site

    @jira:123
    Scenario: Check title
      Given I do something
      ...
```
В определении шага:
```ts
Given('I do something', async ({ $tags }) => {
  console.log($tags); // выводит ["@slow", "@jira:123"]
});
```

Наиболее мощное использование `$tags` - в ваших пользовательских фикстурах.

##### Пример 1: Запуск теста в конкретном браузере

Представьте, что вы хотите запустить сценарий только в Firefox, если есть тег `@firefox`:
```gherkin
Feature: some feature

    @firefox
    Scenario: Runs only in Firefox
      ...
```

Настройте пользовательскую фикстуру, которая проверяет `$tags` и пропускает тест в не-firefox браузере:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ firefoxOnly: void }>({
  firefoxOnly: [
    async ({ $tags, defaultBrowserType }, use, testInfo) => {
      if ($tags.includes('@firefox') && defaultBrowserType !== 'firefox') {
        testInfo.skip();
      }
      await use();
    },
    { auto: true },
  ],
});
```

##### Пример 2: Установка локали для теста
Перезапишите локаль на `fi`, если тест имеет тег `@LocaleFi`:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  locale: async ({ $tags, locale }, use) => {
    if ($tags.includes('@LocaleFi')) {
      locale = 'fi';
    }
    await use(locale);
  },
});
```

##### Пример 3: Переключение на мобильный viewport для теста
Перезапишите `viewport` для сценариев с тегом `@mobile`:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  viewport: async ({ $tags, viewport }, use) => {
    if ($tags.includes('@mobile')) {
      viewport = { width: 375, height: 667 };
    }
    await use(viewport);
  }
});
```
