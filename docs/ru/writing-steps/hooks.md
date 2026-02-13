# Хуки

Хуки - это функции, которые автоматически запускаются до/после воркеров или сценариев:

* `BeforeWorker / BeforeAll` - запускается **один раз в каждом воркере**, перед всеми сценариями
* `AfterWorker / AfterAll` - запускается **один раз в каждом воркере**, после всех сценариев
* `BeforeScenario / Before` - запускается **перед каждым сценарием**
* `AfterScenario / After` -  запускается **после каждого сценария**
* `BeforeStep` - запускается **перед каждым шагом**
* `AfterStep` -  запускается **после каждого шага**

> Если вам нужно запустить код **до/после общего выполнения тестов**, ознакомьтесь с [зависимостями проектов](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies) или [глобальной настройкой и завершением](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown) Playwright

## Фикстуры<a id="fixtures"></a>

Хотя хуки являются хорошо известной концепцией, Playwright предлагает лучшую альтернативу - [фикстуры](https://playwright.dev/docs/test-fixtures#introduction). В большинстве случаев фикстуры могут полностью заменить хуки и предоставить [много преимуществ](https://playwright.dev/docs/test-fixtures#with-fixtures). По умолчанию всегда рассматривайте использование фикстур.

#### Пример переписывания кода с хуков на фикстуры

Представьте сценарий с шагом, требующим авторизации пользователя:
```gherkin
Feature: Some feature

    Scenario: Some scenario
        Given I am an authorized user
```
Нам нужно обернуть сценарий действиями входа/выхода.

**В Cucumber** вы можете добавить тег (например, `@auth`) к этому сценарию:
```gherkin
Feature: Some feature

    @auth
    Scenario: Some scenario
        Given I am an authorized user
```
И зарегистрировать хуки `Before / After` для запуска с этим тегом:

```ts
Before({ tags: '@auth' }, async function () {
  // выполнить вход
});

After({ tags: '@auth' }, async function () {
  // выполнить выход
});
```

**В Playwright** вы можете создать следующую фикстуру `auth`:
```ts
export const test = base.extend({
  auth: async ({}, use) => {
    // выполнить вход
    await use({ username: 'some user' });
    // выполнить выход
  }
});
```
и использовать эту фикстуру `auth` в шаге:
```ts
Given('I am an authorized user', async ({ auth }) => {
  console.log('step for authorized user', auth.username);
});
```
Playwright автоматически обернет код теста входом и выходом пользователя.

Преимущества использования фикстур:
- фикстура выполняется только когда фактически используется
- нет дополнительных тегов
- код фикстуры переиспользуется в других фичах

## BeforeWorker / BeforeAll<a id="beforeworker-beforeall"></a>

> Рассмотрите использование [фикстур](#fixtures) вместо хуков.

Playwright-BDD поддерживает хук уровня воркера `BeforeWorker` (с псевдонимом `BeforeAll`). Он запускается **один раз в каждом воркере, перед всеми сценариями**.

?> Хотя `BeforeAll` более используемое имя, `BeforeWorker` лучше выражает, когда запускается хук.

#### Использование

1. Создайте и экспортируйте функцию `BeforeWorker`:

    ```ts
    // fixtures.ts
    import { test as base, createBdd } from 'playwright-bdd';

    export const test = base.extend({ /* ...ваши фикстуры */ });

    export const { BeforeWorker } = createBdd(test);
    ```

2. Определите хуки:

    ```ts
    // hooks.ts
    import { BeforeWorker } from './fixtures';

    BeforeWorker(async ({ $workerInfo, browser }) => {
      // ...этот код запускается один раз в каждом воркере и использует фикстуры с областью видимости воркера
    });
    ```

С версии Playwright-BDD **v8** вы можете привязать хук воркера к конкретным фичам через `tags`:

```ts
BeforeWorker({ tags: '@auth' }, async () => { ... });
```

Это эффективно работает как хук **BeforeFeature**.

Вы также можете предоставить теги по умолчанию через `createBdd()`:
```ts
const { BeforeWorker } = createBdd(test, { tags: '@mobile' });

BeforeWorker(async () => {
  // запускается только для фич с @mobile
});
```

Дополнительно вы можете установить `name` и `timeout` для хука:
```ts
BeforeWorker({ name: 'setup database', timeout: 1000 }, async () => {
  // запускается с таймаутом 1000 мс
});
```

Функция хука принимает **1 аргумент** - [фикстуры с областью видимости воркера](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures).
Вы можете получить доступ к [$workerInfo](https://playwright.dev/docs/api/class-workerinfo) и любым встроенным или пользовательским фикстурам. См. подробности в [BeforeWorker / BeforeAll API](api.md#beforeworker-beforeall).

#### Пример использования `BeforeWorker` с пользовательской фикстурой

Представьте, что вы определили пользовательскую фикстуру воркера `myWorkerFixture`:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{}, { myWorkerFixture: MyWorkerFixture }>({
  myWorkerFixture: [async ({}, use) => {
    // ... настройка myWorkerFixture
  }, { scope: 'worker' }]
});

export const { BeforeWorker } = createBdd(test);
```

Теперь вы можете использовать `myWorkerFixture` в созданных хуках:
```ts
import { BeforeWorker } from './fixtures';

BeforeWorker(async ({ myWorkerFixture }) => {
  // ... использование myWorkerFixture в хуке
});
```

> Обратите внимание, что в хуках `BeforeWorker / AfterWorker` **нет доступа к World**, потому что World пересоздается для каждого теста. Вот [обсуждение](https://github.com/cucumber/cucumber-js/issues/1393) в репозитории Cucumber.

?> Если вам нужно запустить хук **один раз для всех воркеров**, ознакомьтесь с [Запуск хука один раз](#running-hook-once).

## AfterWorker / AfterAll

> Рассмотрите использование [фикстур](#fixtures) вместо хуков.

Playwright-BDD поддерживает хук уровня воркера `AfterWorker` (с псевдонимом `AfterAll`).
Он запускается **один раз в каждом воркере, после всех сценариев**.

?> Хотя `AfterAll` более используемое имя, `AfterWorker` лучше выражает, когда запускается хук.

Использование:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...ваши фикстуры */ });

const { AfterWorker } = createBdd(test);

AfterWorker(async ({ $workerInfo, browser }) => {
  // запускается когда каждый воркер завершается
});
```

Все опции и поведение аналогичны [BeforeWorker / BeforeAll](#beforeworker-beforeall).

## BeforeScenario / Before<a id="beforescenario-before"></a>

> Рассмотрите использование [фикстур](#fixtures) вместо хуков.

Playwright-BDD поддерживает хук уровня сценария `BeforeScenario` (с псевдонимом `Before`). Он запускается **перед каждым сценарием**.

?> Хотя `Before` более используемое имя, `BeforeScenario` лучше выражает, когда запускается хук.



#### Использование

1. Создайте и экспортируйте функцию `BeforeScenario`:

    ```ts
    // fixtures.ts
    import { test as base, createBdd } from 'playwright-bdd';

    export const test = base.extend({ /* ...ваши фикстуры */ });

    export const { BeforeScenario } = createBdd(test);
    ```

2. Определите хуки сценария:

    ```ts
    // hooks.ts
    import { BeforeScenario } from './fixtures';

    BeforeScenario(async () => {
      // запускается перед каждым сценарием
    });
    ```

С версии Playwright-BDD **v8** вы можете нацелить хук сценария на конкретные фичи/сценарии через `tags`:

```ts
BeforeScenario({ tags: '@mobile and not @slow' }, async () => {
  // запускается перед сценариями с тегами @mobile и не @slow
});
```

Если вы хотите передать только теги, можете использовать сокращение:
```ts
BeforeScenario('@mobile and not @slow', async () => {
  // запускается для сценариев с @mobile и не @slow
});
```

Вы также можете предоставить теги по умолчанию через `createBdd()`:
```ts
const { BeforeScenario } = createBdd(test, { tags: '@mobile' });

BeforeScenario(async () => {
  // запускается только для сценариев с @mobile
});
```

Если хук имеет и теги по умолчанию, и собственные теги, они объединяются с использованием логики `AND`:
```ts
const { BeforeScenario } = createBdd(test, { tags: '@mobile' });

BeforeScenario({ tags: '@slow' }, async function () {
  // запускается для сценариев с @mobile и @slow
});
```

Дополнительно вы можете установить `name` и `timeout` для хука:
```ts
BeforeScenario({ name: 'my hook', timeout: 5000 }, async function () {
  // ...
});
```

Функция хука принимает **1 аргумент** - [фикстуры с областью видимости теста](https://playwright.dev/docs/test-fixtures#built-in-fixtures). Вы можете получить доступ к [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/bdd-fixtures.md#tags) и любым встроенным или пользовательским фикстурам. См. подробности в [BeforeScenario / Before API](api.md#beforescenario-before).

#### Пример использования `BeforeScenario` с пользовательской фикстурой

Представьте, что вы определили пользовательскую фикстуру `myFixture`:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({ page }, use) => { // <-- пользовательская фикстура
    // ...
  }
});

export const { BeforeScenario } = createBdd(test);
```

Теперь вы можете использовать `myFixture` в созданных хуках:
```ts
import { BeforeScenario } from './fixtures';

BeforeScenario(async ({ myFixture }) => {
  // ... использование myFixture в хуке
});
```

## AfterScenario / After

> Рассмотрите использование [фикстур](#fixtures) вместо хуков.

Playwright-BDD поддерживает хук уровня сценария `AfterScenario` (с псевдонимом `After`). Он запускается **после каждого сценария**.

?> Хотя `After` более используемое имя, `AfterScenario` лучше выражает, когда запускается хук.

Использование:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...ваши фикстуры */ });

const { AfterScenario } = createBdd(test);

AfterScenario(async () => {
  // запускается после каждого сценария
});
```

Все опции и поведение аналогичны [BeforeScenario / Before](#beforescenario-before).

## BeforeStep

Playwright-BDD поддерживает хук уровня шага `BeforeStep`. Он запускается **перед каждым шагом**.

Использование:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...ваши фикстуры */ });

const { BeforeStep } = createBdd(test);

BeforeStep(async () => {
  // запускается перед каждым шагом
});
```

Вы можете нацелить хук шага на шаги конкретной фичи/сценария через `tags`:

```ts
BeforeStep({ tags: '@mobile and not @slow' }, async function () {
  // запускается для сценариев с @mobile и не @slow
});
```
Если вы хотите передать только теги, можете использовать сокращение:
```ts
BeforeStep('@mobile and not @slow', async function () {
  // запускается для сценариев с @mobile и не @slow
});
```
Вы также можете предоставить теги по умолчанию через `createBdd()`:
```ts
const { BeforeStep } = createBdd(test, { tags: '@mobile' });

BeforeStep(async () => {
  // запускается только для сценариев с @mobile
});
```

Если хук имеет и теги по умолчанию, и собственные теги, они объединяются с использованием логики `AND`:
```ts
const { BeforeStep } = createBdd(test, { tags: '@mobile' });

BeforeStep({ tags: '@slow' }, async function () {
  // запускается для сценариев с @mobile и @slow
});
```

Дополнительно вы можете установить `name` и `timeout` для хука:
```ts
BeforeStep({ name: 'my hook', timeout: 5000 }, async function () {
  // ...
});
```

Функция хука принимает **1 аргумент** - [фикстуры с областью видимости теста](https://playwright.dev/docs/test-fixtures#built-in-fixtures). Вы можете получить доступ к [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/bdd-fixtures.md#tags) и любым встроенным или пользовательским фикстурам. См. подробности в [BeforeScenario / Before API](api.md#beforescenario-before).

## AfterStep

> Рассмотрите использование [фикстур](#fixtures) вместо хуков.

Playwright-BDD поддерживает хук уровня сценария `AfterStep`. Он запускается **после каждого шага**.

Использование:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...ваши фикстуры */ });

const { AfterStep } = createBdd(test);

AfterStep(async () => {
  // запускается после каждого сценария
});
```

Все опции и поведение аналогичны [BeforeStep](#beforestep).

#### Пример использования `AfterStep` для захвата скриншота после каждого шага

Создайте `fixtures.ts`:
```ts
export const { AfterStep } = createBdd(test);
```

Импортируйте `fixtures.ts` в определение шагов
```ts
import { AfterStep } from './fixtures';

AfterStep(async ({ page, $testInfo, $step }) => {
  await $testInfo.attach(`screenshot after ${$step.title}`, {
    contentType: 'image/png',
    body: await page.screenshot()
  });
});

// ...остальные определения шагов
```

## Запуск хука один раз<a id="running-hook-once"></a>

`BeforeAll` / `AfterAll` запускаются **один раз на воркер**, а не один раз для всего запуска теста. Это может быть не то, что вы хотите. Например, если вы заполняете базу данных тестовыми данными, нет необходимости перезаполнять её в каждом воркере:

```ts
import { BeforeWorker } from './fixtures';

BeforeWorker(async () => {
  await populateDatabase(); // <-- запускается в каждом воркере
});
```

Чтобы запустить код внутри хука ровно один раз, вы можете использовать [@vitalets/global-cache](https://github.com/vitalets/global-cache). Он позволяет кешировать и переиспользовать любые сериализуемые данные во всех воркерах:

```ts
import { BeforeWorker } from './fixtures';
import { globalCache } from '@vitalets/global-cache';

BeforeWorker(async () => {
  await globalCache.get('populate-db', async () => {
    await populateDatabase(); // <-- запускается один раз
  });
});
```

> См. [README](https://github.com/vitalets/global-cache) global-cache для инструкций по настройке.

Вы также можете использовать этот подход в хуках `BeforeScenario` для сохранения данных и [переиспользования](writing-steps/passing-data-between-steps.md) их в шагах:

```ts
BeforeScenario(async ({ ctx }) => {
  ctx.userIds = await globalCache.get('user-ids', async () => {
    const userIds = await populateDatabase();
    return userIds;
  });
});
```

Вы можете использовать глобальный кеш и в фикстурах. Например, оберните код в фикстуру `storageState`, чтобы аутентифицироваться только при необходимости и кешировать на 1 час:

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';
import { globalCache } from '@vitalets/global-cache';

export const test = base.extend({
  storageState: async ({ storageState, browser }, use, testInfo) => {
    // Пропустить аутентификацию для сценариев с тегом @no-auth
    if (testInfo.tags.includes('@no-auth')) return use(storageState);

    // Получить состояние аутентификации один раз и закешировать на 1 час
    const authState = await globalCache.get('auth-state', { ttl: '1 hour' }, async () => {
      const loginPage = await browser.newPage();
      // ...аутентификация
      return loginPage.context().storageState();
    });

    await use(authState);
  },
});

export const { Given, When, Then } = createBdd(test);
```

Это может значительно ускорить ваши тесты при полностью параллельном и sharded запуске.
