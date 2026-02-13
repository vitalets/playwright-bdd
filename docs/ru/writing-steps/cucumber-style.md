# Шаги в стиле Cucumber

Определения шагов в стиле Cucumber совместимы с [CucumberJS](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/step_definitions.md).

 * определения шагов используют World (`this`) для взаимодействия с браузером
 * определения шагов получают только параметры шага, не получают пользовательские фикстуры в качестве первого аргумента
 * определения шагов не могут быть определены как стрелочные функции

С точки зрения Playwright, World - это просто фикстура с областью видимости теста, которая автоматически предоставляется всем определениям шагов.

С версии **Playwright-BDD v7** вы можете определить World как пользовательский класс, без расширения Cucumber World. Структура World зависит от вас, вы можете передать любые фикстуры как свойства world и использовать их позже в определениях шагов.

**Пример настройки в стиле cucumber:**

1. Определите World:

```ts
// world.ts
import { Page } from '@playwright/test';

export class World {
  constructor(public page: Page) {}

  async openHomePage() {
    await this.page.goto('https://playwright.dev');
  }
}
```

> Нет необходимости вызывать `setWorldConstructor`, как это было раньше для [пользовательского world в CucumberJs](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md#custom-worlds).

2. Расширьте тест Playwright фикстурой `world` и создайте `Given / When / Then`:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use) => {
    const world = new World(page);
    await use(world);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test, {
  worldFixture: 'world'
});
```

> Убедитесь, что вы экспортируете экземпляр `test`, потому что он используется в сгенерированных тестовых файлах

3. Используйте эти `Given / When / Then` для определения шагов, экземпляр world доступен как `this`:

```ts
// steps.ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.openHomePage();
});
```

См. [полный пример стиля Cucumber](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Пользовательские фикстуры
Вы можете предоставить пользовательские фикстуры шагам в стиле cucumber.
Чтобы достичь этого, назначьте пользовательскую фикстуру свойству объекта World
и затем обращайтесь к ней через `this`:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';

type World = {
  page: Page;
  myFixture: MyFixture; // <- свойство пользовательской фикстуры
};

export const test = base.extend<{ world: World }>({
  myFixture: async ({}, use) => {
    // настройка myFixture...
  },
  world: async ({ page, myFixture }, use) => {
    const world: World = { page, myFixture };
    await use(world);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test, {
  worldFixture: 'world'
});
```

Используйте `this.myFixture` в определениях шагов:
```ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  console.log(this.myFixture);
});
```

### Есть ли world по умолчанию?
Нет. Вы определяете весь World с нуля.

В простейшем случае вы можете создать world как простой объект со свойством `page`:
```js
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  world: async ({ page }, use) => {
    const world = { page };
    await use(world);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test, { worldFixture: 'world' });
```
