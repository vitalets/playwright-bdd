# Шаги в стиле Playwright
Стиль Playwright позволяет писать определения шагов как обычные тесты Playwright.

* Функции шагов принимают пользовательские фикстуры в качестве первого аргумента, остальные - это параметры шага.
* Функции шагов не используют `this` (World).
* Функции шагов можно (и нужно) определять как стрелочные функции.

Чтобы получить `Given / When / Then` для стиля Playwright с фикстурами по умолчанию, вызовите `createBdd()` без аргументов:

```ts
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('I click link {string}', async ({ page }, name: string) => {
  await page.getByRole('link', { name }).click();
});
```

> Обычно функции шагов асинхронные, но они также могут быть синхронными.

См. [полный пример стиля Playwright](https://github.com/vitalets/playwright-bdd/tree/main/examples/basic-cjs).

## Пользовательские фикстуры
Вы можете использовать [пользовательские фикстуры](https://playwright.dev/docs/test-fixtures#with-fixtures) в определениях шагов.

1. Расширьте базовый `test` из `playwright-bdd` пользовательскими фикстурами:
    ```ts
    // fixtures.ts
    // Примечание: импортируйте base из playwright-bdd, а не из @playwright/test!
    import { test as base } from 'playwright-bdd';

    export const test = base.extend<{ myFixture: MyFixture }>({
      myFixture: async ({ page }, use) => {
        await use(new MyFixture(page));
      }
    });
    ```
  > Убедитесь, что вы **экспортируете** экземпляр `test`, потому что он используется в сгенерированных файлах.

2. Из того же файла экспортируйте `Given / When / Then`, привязанные к пользовательскому `test`:
    ```ts
    // fixtures.ts
    // Примечание: импортируйте base из playwright-bdd, а не из @playwright/test!
    import { test as base } from 'playwright-bdd';

    export const test = base.extend<{ myFixture: MyFixture }>({
      myFixture: async ({ page }, use) => {
        await use(new MyFixture(page));
      }
    });

    export const { Given, When, Then } = createBdd(test); // <- экспортируйте Given, When, Then
    ```

3. Используйте эти `Given / When / Then` для определения шагов:
    ```ts
    // steps.ts
    import { createBdd } from 'playwright-bdd';
    import { Given, When, Then } from './fixtures';

    Given('I open url {string}', async ({ myFixture }, url: string) => {
      // ...
    });
    ```

!> Для пользователей TypeScript: если вы перезаписываете **только встроенные** фикстуры Playwright, вы должны передать `object` в качестве параметра generic типа в `test.extend<object>()` для правильной типизации.

Например, если вы перезаписываете только встроенную фикстуру `page`:
```ts
// неверно:
// export const test = base.extend({ ... });

export const test = base.extend<object>({  // <- обратите внимание на параметр <object>
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL);
    await use(page);
  },
});
```

## World по умолчанию

Хотя использование `this` (World) в шагах стиля Playwright не рекомендуется, некоторые пользователи все же хотят это
для плавной миграции с CucumberJS.
По этой причине Playwright-BDD предоставляет world по умолчанию как пустой объект `{}` для шагов стиля Playwright.
Вы можете использовать обычные функции (не стрелочные!) и получать доступ к world по умолчанию через `this`:

```ts
Given('step 1', async function ({ page }) {
  this.foo = 'bar';
});

Then('step 2', async function () {
  expect(this.foo).toEqual('bar');
});
```

> См. также [Передача данных между шагами](ru/writing-steps/passing-data-between-steps.md).
