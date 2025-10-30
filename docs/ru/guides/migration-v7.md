# Миграция на v7

Playwright-BDD **v7** представляет несколько значительных улучшений, в первую очередь **удаление зависимости от раннера Cucumber** ([#136](https://github.com/vitalets/playwright-bdd/issues/136)). Теперь фичи и шаги обрабатываются напрямую без вовлечения пакета `@cucumber/cucumber`, улучшая опыт разработки, производительность и будущую поддержку. Это руководство охватывает все изменения и необходимые действия.

Руководство состоит из двух частей, в зависимости от стиля шагов, который вы используете:
1. Действия для **всех пользователей**
2. Дополнительные действия для **cucumber-style**

## Все пользователи
Приведенные ниже действия относятся ко всем пользователям playwright-bdd.

### Обновление пакетов
Удалите `@cucumber/cucumber` и обновите `playwright-bdd`:
```
npm un @cucumber/cucumber
npm i -D playwright-bdd@latest
```

### Новая опция `steps`
Начиная с версии 7, используйте универсальную опцию `steps` вместо опций `require` и `import` из Cucumber. Эта опция `steps` - это glob паттерн, который ищет файлы определений шагов и может быть определен как строка или массив строк. В отличие от [Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code), **нет местоположения по умолчанию** для этих файлов. Если ваша конфигурация полагается на местоположение по умолчанию, явно укажите путь `steps`.

До:
```ts
const testDir = defineBddConfig({
  require: ['steps/*.ts'],
  // или для ESM
  // import: ['steps/*.ts'],
});
```
С v7:
```ts
const testDir = defineBddConfig({
  steps: 'steps/*.ts'
});
```

> Опции `require` и `import` все еще разрешены в BDD конфигурации, но под капотом они конвертируются в `steps` и будут удалены в будущем.

### Новая опция `features`
Используйте новую опцию `features` вместо `paths`. Поведение `features` такое же, за исключением того, что **нет местоположения по умолчанию** для файлов фичей, в отличие от [Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features). Если ваша конфигурация полагается на местоположение по умолчанию, укажите путь к фичам явно.

До:
```ts
const testDir = defineBddConfig({
  paths: ['features/*.feature'],
});
```
С v7:
```ts
const testDir = defineBddConfig({
  features: 'features/*.feature',
});
```

> Опция `paths` все еще разрешена в BDD конфигурации, но под капотом она конвертируется в `features` и будет удалена в будущем.

### Пропуск `importTestFrom`
С v7, опция конфигурации `importTestFrom` может быть опущена в большинстве случаев. Playwright-BDD теперь автоматически проверяет определения шагов и определяет оптимальный файл для импорта `test`. Единственное требование - включить файлы фикстур в паттерн опции `steps`.

До:
```ts
const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  steps: ['steps/steps.ts'],
});
```
С v7:
```ts
const testDir = defineBddConfig({
  steps: ['steps/steps.ts', 'steps/fixtures.ts']
});
// ИЛИ
const testDir = defineBddConfig({
  steps: 'steps/*.ts'
});
```

> `importTestFrom` все еще можно использовать для специфических случаев. Если у вас есть такой случай, не стесняйтесь поделиться им в issues, и мы можем улучшить алгоритм.

### Конфигурация Cucumber
До v7, если был файл `cucumber.js`, он загружался и объединялся с BDD конфигурацией. Теперь `cucumber.js` больше не загружается. Единственный источник опций - это `defineBddConfig()` в `playwright.config.ts`.

> Если вам нужна опция Cucumber, которая не поддерживается, не стесняйтесь запросить её в [issues](https://github.com/vitalets/playwright-bdd/issues).

### Сниппеты
До v7, вы могли настроить [сниппеты](https://github.com/cucumber/cucumber-js/blob/main/docs/snippets.md) через опции Cucumber `snippetInterface` / `snippetSyntax`. Теперь эти опции удалены из BDD конфигурации. Playwright-BDD автоматически определяет стиль ваших шагов (playwright-style / cucumber-style / decorators) и показывает правильный синтаксис для отсутствующих шагов.

Пример сниппета в стиле Playwright:
```
Some steps are without definition!

// 1. Missing step definition for "features/one.feature:23:5"
Then('I see in title {string}', async ({}, arg: string) => {
  // ...
});

Missing step definitions: 1.
Use snippets above to create them.
```

> Если у вас есть строгое требование для пользовательских сниппетов, не стесняйтесь открыть issue.

### Пользовательские типы параметров
- `defineParameterType` должен импортироваться из `playwright-bdd` вместо `@cucumber/cucumber`.
- `defineParameterType` теперь поддерживается в шагах с декораторами!

Пример:
```ts
import { defineParameterType } from 'playwright-bdd';

type Color = 'red' | 'blue' | 'yellow';
defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

Given('step with {color}', ({}, color: Color) => { ... });
```

### ESM
ESM проекты могут быть выполнены без `--loader=ts-node/esm` (с Playwright 1.41).

До:
```
npx cross-env NODE_OPTIONS="--loader=ts-node/esm --no-warnings" bddgen && npx playwright test
```
С v7:
```
npx bddgen && npx playwright test
```

### DataTable
`DataTable` должен импортироваться из `playwright-bdd` вместо `@cucumber/cucumber`.

До:
```ts
import { DataTable } from '@cucumber/cucumber';
```
С v7:
```ts
import { DataTable } from 'playwright-bdd';
```

### Другие изменения
* Минимальная версия Playwright повышена до **v1.35**
* Минимальная версия Node.js повышена до **v18**

## Действия для Cucumber-style
Шаги в стиле Cucumber требуют некоторых дополнительных действий из-за удаления `@cucumber/cucumber`.

### Импорт Given / When / Then
До v7, `Given / When / Then` для cucumber-style импортировались напрямую из пакета `@cucumber/cucumber`. Теперь эти функции должны быть созданы из `createBdd()` аналогично шагам в стиле Playwright. Единственное отличие - вы должны передать дополнительную опцию (описана ниже).

До:

```ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('I am on home page', async function () {
  await this.page.goto('/');
});
```
С v7:

**fixtures.ts**
```ts
import { test as base, createBdd } from 'playwright-bdd';

// определить простейший world (см. следующую секцию для подробностей)
type World  = { page: Page };

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use) => {
    const world = { page };
    await use(world);
  },
});

export const { Given, When, Then } = createBdd(test, {
  worldFixture: 'world'
});
```

**steps.ts**
```ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.page.goto('/');
});
```

> Ознакомьтесь с полным примером в стиле Cucumber в [examples/cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Cucumber world
С v7, нет встроенного `World`. Если вам нужен world для шагов в стиле cucumber, определите его с нуля как фикстуру Playwright. Вы не ограничены наследованием world от какого-либо базового класса. Затем передайте имя фикстуры world в `createBdd` и получите `Given / When / Then`, привязанные к этому world.

Пример:

1. **world.ts** - создать world

```ts
import { Page, TestInfo } from '@playwright/test';

export class MyWorld {
  constructor (public page: Page, testInfo: TestInfo) {}

  async openHomepage() {
    await this.page.goto('/');
  }

  async clickLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
};
```

2. **fixtures.ts** - обернуть world в фикстуру Playwright и привязать к `Given / When / Then`

```ts
import { test as base, createBdd } from 'playwright-bdd';
import { MyWorld } from './world';

export const test = base.extend<{ myWorld: MyWorld }>({
  myWorld: async ({ page }, use, testInfo) => use(new MyWorld(page, testInfo));
});

export const { Given, When, Then } = createBdd(test, {
  worldFixture: 'myWorld' // <- указать имя фикстуры world
});
```

3. **steps.ts** - писать шаги используя world как `this`

```ts
import { Given, When, Then } from './fixtures';

Given('I am on the home page', async function () {
  await this.openHomepage()
});

When('I click link {string}', async function (text: string) {
  await this.clickLink(text);
});
```

> Ознакомьтесь с полным примером в стиле Cucumber в [examples/cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Могу ли я получить предыдущий BddWorld в v7?
Да. Предыдущий `BddWorld` извлечен в отдельный файл [bddWorld.ts](https://github.com/vitalets/playwright-bdd/blob/v7/test/bdd-world-extracted/steps/bddWorld.ts). Вы можете скопировать/вставить его и настроить позже под свои нужды. После копирования, ознакомьтесь с [fixtures.ts](https://github.com/vitalets/playwright-bdd/blob/v7/test/bdd-world-extracted/steps/fixtures.ts), чтобы увидеть, как инициализировать BddWorld в вашем коде.

?> Если вы обнаружили какую-либо ошибку/отсутствующий пункт в этом руководстве, не стесняйтесь открыть [issue](https://github.com/vitalets/playwright-bdd/issues) на GitHub.
