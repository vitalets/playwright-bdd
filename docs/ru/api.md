# API

### defineBddConfig

Определяет BDD конфигурацию внутри конфигурационного файла Playwright.

**Использование:** `defineBddConfig(config)`

**Параметры:**
  * `config` *object* - BDD [конфигурация](configuration/index.md)

**Возвращает:** *string* - Директория, где будут сгенерированы тестовые файлы.

### defineBddProject
<div style="color: gray; font-size: 0.8em">С версии <b>v7.0.0</b></div>

Тонкая обертка вокруг `defineBddConfig()`, которая упрощает BDD конфигурацию для проектов Playwright. Она принимает имя проекта и автоматически устанавливает [`outputDir`](configuration/options.md#outputdir) на основе этого имени. Функция возвращает объект `{ name, testDir }`, который может быть объединен с конфигурацией проекта с помощью оператора распространения.

**Использование:** `defineBddProject(config)`

**Параметры:**
  * `config` *object* - BDD [конфигурация](configuration/index.md) + имя проекта `{ name: string }`

**Возвращает:** *{ name, testDir }* - Объект, содержащий имя проекта и директорию сгенерированных тестов.

Пример:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      ...defineBddProject({
        name: 'foo',
        features: '*.feature',
        steps: 'steps/*.ts',
      }), // -> { name: 'foo', testDir: '.features-gen/foo' }
    },
  ]
});
```

### cucumberReporter

Вспомогательная функция для вывода результатов тестов в различных [репортерах Cucumber](reporters/cucumber.md).

**Использование:** `cucumberReporter(reporter[, options])`

**Параметры:**
  * `reporter` *string* - Имя репортера Cucumber (`html|json|junit|message`) или путь к пользовательскому файлу репортера.
  * `options` *object* - Опции репортера Cucumber.

**Возвращает:** *array* - Кортеж конфигурации репортера Playwright.

Пример использования в `playwright.config.ts`:
```ts
import { cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [
    cucumberReporter('html', { outputFile: `reports/report.html` }),
  ],
  // ...другие опции
});
```

### createBdd

Создает функции для определения шагов и хуков.

**Использование:** `createBdd([test][, options])`

> До Playwright-BDD **v7**, второй параметр был `WorldConstructor`.

**Параметры:**
  * `test` *object* - Экземпляр теста для предоставления доступа к пользовательским фикстурам в шагах.
  * `options` *object* - Опции:
    - `worldFixture` *string* - Имя фикстуры, которая будет использоваться как World в шагах в стиле cucumber.
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) по умолчанию, которое будет применено ко всем шагам/хукам.

**Возвращает:** *object* - `{ Given, When, Then, Step, BeforeScenario, AfterScenario, BeforeWorker, AfterWorker, Before, After, BeforeAll, AfterAll }`

По умолчанию созданные функции работают с шагами в [стиле Playwright](writing-steps/playwright-style.md). Если `options.worldFixture` определен, созданные функции работают с шагами в [стиле Cucumber](writing-steps/cucumber-style.md).

### Given / When / Then / Step

Функции для определений шагов.

**Использование:**
 - `Given(pattern[, options], fn)`
 - `When(pattern[, options], fn)`
 - `Then(pattern[, options], fn)`
 - `Step(pattern[, options], fn)`

**Параметры:**
  * `pattern` *string | regexp* - Строка [выражения Cucumber](https://github.com/cucumber/cucumber-expressions) или RegExp.
  * `options` *object* - Опции шага:
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для привязки этого шага к конкретным фичам/сценариям.
  * `fn` *function* - Функция шага `(fixtures, ...args) => void`:
    - `fixtures` *object* - Фикстуры Playwright (опущены в стиле cucumber).
    - `...args` *array* - Аргументы, захваченные из паттерна шага.

**Возвращает:** *function* - Функция для вызова этого шага из других шагов.

### BeforeStep

Определяет хук, который запускается **перед каждым шагом**. Вы можете нацелить хук на конкретный шаг, предоставив опцию `tags`.

**Использование:** `BeforeStep([options,] hookFn)`

**Параметры:**
  * `options` *string | object*
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для нацеливания этого хука на конкретные фичи/шаги.
    - `name` *string* - Необязательное имя для этого хука для отчетности.
    - `timeout` *number* - Таймаут для этого хука в миллисекундах.
  * `hookFn` *Function* - Функция хука `(fixtures?) => void`:
    - `fixtures` *object* - Фикстуры Playwright:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - Список тегов для текущего шага.
      - Любые другие встроенные и пользовательские фикстуры.

### AfterStep

Определяет хук, который запускается **после каждого сценария**. Вы можете нацелить хук на конкретный шаг, предоставив опцию `tags`.

**Использование:** `AfterStep([options,] hookFn)`

**Параметры:**
  * `options` *string | object*
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для нацеливания этого хука на конкретные фичи/шаги.
    - `name` *string* - Необязательное имя для этого хука для отчетности.
    - `timeout` *number* - Таймаут для этого хука в миллисекундах.
  * `hookFn` *Function* - Функция хука `(fixtures?) => void`:
    - `fixtures` *object* - Фикстуры Playwright:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - Список тегов для текущего шага.
      - Любые другие встроенные и пользовательские фикстуры.

### BeforeScenario / Before

Определяет хук, который запускается **перед каждым сценарием**. Вы можете нацелить хук на конкретные сценарии, предоставив опцию `tags`. `BeforeScenario` и `Before` - это псевдонимы.

**Использование:** `BeforeScenario([options,] hookFn)`

**Параметры:**
  * `options` *string | object*
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для нацеливания этого хука на конкретные фичи/сценарии.
    - `name` *string* - Необязательное имя для этого хука для отчетности.
    - `timeout` *number* - Таймаут для этого хука в миллисекундах.
  * `hookFn` *Function* - Функция хука `(fixtures?) => void`:
    - `fixtures` *object* - Фикстуры Playwright:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - Список тегов для текущего сценария.
      - Любые другие встроенные и пользовательские фикстуры.

### AfterScenario / After

Определяет хук, который запускается **после каждого сценария**. Вы можете нацелить хук на конкретные сценарии, предоставив опцию `tags`. `AfterScenario` и `After` - это псевдонимы.

**Использование:** `AfterScenario([options,] hookFn)`

**Параметры:**
  * `options` *string | object*
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для нацеливания этого хука на конкретные фичи/сценарии.
    - `name` *string* - Необязательное имя для этого хука для отчетности.
    - `timeout` *number* - Таймаут для этого хука в миллисекундах.
  * `hookFn` *Function* - Функция хука `(fixtures?) => void`:
    - `fixtures` *object* - Фикстуры Playwright:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo).
      - `$tags` *string[]* - Список тегов для текущего сценария.
      - Любые другие встроенные и пользовательские фикстуры.

### BeforeWorker / BeforeAll

Определяет хук, который запускается **один раз в каждом воркере**, перед всеми сценариями. Вы можете нацелить хук на конкретные сценарии, предоставив опцию `tags`. `BeforeWorker` и `BeforeAll` - это псевдонимы.

> Обратите внимание, что для хуков воркера имеет смысл предоставлять только *теги уровня фичи*. Теги уровня сценария все равно запустят хук для всего файла фичи, а не для конкретного сценария.

**Использование:** `BeforeWorker([options,] hookFn)`

**Параметры:**
  * `options` *string | object*
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для нацеливания этого хука на конкретные фичи.
    - `name` *string* - Необязательное имя для этого хука для отчетности.
    - `timeout` *number* - Таймаут для этого хука в миллисекундах.
  * `hookFn` *Function* - Функция хука `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [фикстуры с областью видимости воркера](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo).
      - Любые другие встроенные и пользовательские **фикстуры с областью видимости воркера**.

?> Если вам нужно запустить хук **один раз для всех воркеров**, ознакомьтесь с [Запуск хука один раз](writing-steps/hooks.md#running-hook-once).

### AfterWorker / AfterAll

Определяет хук, который запускается **один раз в каждом воркере**, после всех сценариев. Вы можете нацелить хук на конкретные сценарии, предоставив опцию `tags`. `AfterWorker` и `AfterAll` - это псевдонимы.

> Обратите внимание, что для хуков воркера имеет смысл предоставлять только *теги уровня фичи*. Теги уровня сценария все равно запустят хук для всего файла фичи, а не для конкретного сценария.

**Использование:** `AfterWorker([options,] hookFn)`

**Параметры:**
  * `options` *string | object*
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для привязки этого хука к конкретным фичам.
    - `name` *string* - Необязательное имя для этого хука для отчетности.
    - `timeout` *number* - Таймаут для этого хука в миллисекундах.
  * `hookFn` *Function* - Функция хука `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [фикстуры с областью видимости воркера](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo).
      - Любые другие встроенные и пользовательские **фикстуры с областью видимости воркера**.

### @Fixture

Декоратор класса для привязки Page Object Model (POM) к имени фикстуры.

**Использование:** `@Fixture(nameOrOptions)`

**Параметры:**
  * `nameOrOptions` *string* - Имя фикстуры для данного класса.
  * `nameOrOptions` *object* - Опции фикстуры:
    - `name` *string* - Имя фикстуры для данного класса.
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для привязки всех шагов этого класса к конкретным фичам/сценариям.

Также возможно предоставить тип `test` в качестве обобщенного параметра, чтобы ограничить `fixtureName` доступными именами фикстур:
```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage { ... };
```

### @Given / @When / @Then / @Step

Декоратор для пометки метода как BDD шага.

**Использование:**
  - `@Given(pattern[, options])`
  - `@When(pattern[, options])`
  - `@Then(pattern[, options])`
  - `@Step(pattern[, options])`

**Параметры:**
  * `pattern` *string | regexp* - Паттерн шага как [выражение cucumber](https://github.com/cucumber/cucumber-expressions) или RegExp.
  * `options` *object* - Опции шага:
    - `tags` *string* - [Выражение тегов](https://github.com/cucumber/tag-expressions) для привязки этого шага к конкретным фичам/сценариям.
