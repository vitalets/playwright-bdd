# Репортеры Cucumber

Playwright-BDD предоставляет специальный адаптер для вывода результатов тестов с помощью [репортеров Cucumber (форматтеров)](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md).

В настоящее время поддерживаются следующие репортеры:

* [html](#html)
* [json](#json)
* [junit](#junit)
* [message](#message)
* [custom](#custom)

#### Автоматические скриншоты / видео / трейсы
Playwright-BDD полностью поддерживает автоматическое прикрепление **скриншотов**, **видео** и **трейсов** ко всем отчетам Cucumber. Включите эти опции в [конфигурации Playwright](https://playwright.dev/docs/test-use-options#recording-options).

<details><summary>Пример HTML отчета с прикрепленным скриншотом, видео и трейсом</summary>

![html report](./../../reporters/_media/html-report-attachments.png)

</details>

#### Проекты

Форматтеры Cucumber изначально не поддерживают [концепцию проектов](https://playwright.dev/docs/test-projects#introduction) в Playwright. Однако Playwright-BDD адаптирует результаты тестов для отображения проектов в отчете Cucumber.

Итоговый вывод зависит от конкретного репортера. Например, в HTML репортере имя проекта добавляется в начало пути к файлу фичи:

![html report](./../../reporters/_media/html-report-projects.png)

<details><summary>Пример <code>playwright.config.ts</code> с несколькими проектами:</summary>

```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', { outputFile: 'cucumber-report/index.html' })
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

</details>

## html

Генерирует [Cucumber html](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#html) отчет.

Настройте репортер в `playwright.config.js`:
```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
  ],
});
```

<details><summary>Пример <code>report.html</code></summary>

![html report](./../../reporters/_media/html-report.png)

</details>

##### Опции репортера<a id="reporter-options"></a>

* **outputFile** `string` - Путь к выходному HTML файлу.
* **skipAttachments** `boolean | string[]` (по умолчанию: `false`) - Исключить вложения из отчета для уменьшения размера файла. Может быть boolean или массивом типов контента для пропуска.
  * Используйте `image/png` для пропуска скриншотов Playwright.
  * Используйте `video/webm` для пропуска видеозаписей Playwright.
  * Используйте `application/zip` для пропуска файлов трейса Playwright.

  ```js
  export default defineConfig({
    reporter: [
        cucumberReporter('html', {
          outputFile: 'cucumber-report/index.html',
          skipAttachments: [ 'video/webm', 'application/zip' ],
        }),
      ],
    });
  ```
* **externalAttachments** `boolean` - Сохранять вложения как отдельные файлы в директории `data` рядом с файлом отчета. Это может значительно уменьшить размер отчета.
* **attachmentsBaseURL** `string` - Отдельное расположение, куда загружаются вложения из поддиректории `data`. Нужно только когда вы загружаете отчет и данные отдельно в разные места. То же самое, что `attachmentsBaseURL` [HTML репортера](https://playwright.dev/docs/test-reporters#html-reporter) Playwright.

#### Просмотрщик трейсов
Когда вы устанавливаете `externalAttachments: true`, HTML отчет Cucumber встраивает [просмотрщик трейсов](https://playwright.dev/docs/trace-viewer) Playwright:

```js
export default defineConfig({
  reporter: [
    cucumberReporter('html', {
      outputFile: 'cucumber-report/index.html',
      externalAttachments: true,
    }),
  ],
});
```

Чтобы просмотреть трейс по клику, вы должны открыть HTML отчет по схеме `http(s)://`, а не `file://`. Чтобы достичь этого на локальной машине, вы можете запустить HTTP сервер следующей командой:
```
npx http-server ./cucumber-report -c-1 -a localhost -o index.html
```

![html report with trace](./../../reporters/_media/html-report-with-trace.png)

Вы можете добавить эту команду в скрипты `package.json` для быстрого открытия отчета Cucumber:
```json
{
  "scripts": {
    "report": "npx http-server ./cucumber-report -c-1 -a localhost -o index.html"
  }
}
```
Откройте отчет Cucumber:
```
npm run report
```

## json
Генерирует [Cucumber json](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#json) отчет.

Настройте репортер в `playwright.config.js`:
```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('json', { outputFile: 'cucumber-report/report.json' }),
  ],
});
```

<details><summary>Пример <code>report.json</code></summary>

[json report](./../../reporters/_media/json-report.json ':include')

</details>

##### Опции репортера<a id="reporter-options"></a>

* **outputFile** `string` - Путь к выходному JSON файлу.
* **addProjectToFeatureName** `boolean` - Если `true`, имя проекта будет добавлено в начало имени фичи, рекомендуется для запусков с несколькими проектами (по умолчанию: `false`).
* **addMetadata** `none | list | object` - Определяет форму метаданных для прикрепления к элементу фичи. В настоящее время прикрепляются свойства: `Project`, `Browser`. Полезно для сторонних репортеров. Пример метаданных `list`:
    ```json
      {
        "keyword": "Feature",
        "name": "feature one",
        "uri": "features/sample.feature",
        "metadata": [
          { "name": "Project", "value": "my project" },
          { "name": "Browser", "value": "firefox" }
        ]
      },
    ```

* **skipAttachments** `boolean | string[]` (по умолчанию: `false`) - См. [skipAttachments](#reporter-options) в HTML отчете.

Вывод JSON репортера можно использовать для генерации некоторых сторонних отчетов. Ознакомьтесь с этими проектами:

* [WasiqB/multiple-cucumber-html-reporter](https://github.com/WasiqB/multiple-cucumber-html-reporter)
* [gkushang/cucumber-html-reporter](https://github.com/gkushang/cucumber-html-reporter)

## junit
Генерирует [Cucumber junit](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#junit) отчет.

?> Для новых проектов рекомендуется использовать `junit-modern` вместо `junit`, все опции одинаковые.

Настройте репортер в `playwright.config.js`:
```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    // для новых проектов
    cucumberReporter('junit-modern', {
      outputFile: 'cucumber-report/report.xml',
      suiteName: 'my suite'
    }),
    // для старых проектов
    cucumberReporter('junit', {
      outputFile: 'cucumber-report/report.xml',
      suiteName: 'my suite'
    }),
  ],
});
```

<details><summary>Пример <code>report.xml</code></summary>

[junit report](./../../reporters/_media/junit-report.xml ':include')

</details>

##### Опции репортера<a id="reporter-options"></a>

* **outputFile** `string` - Путь к выходному XML файлу.
* **suiteName** `string` - Атрибут имени элемента `testsuite`.

> Junit репортер не содержит вложений.

## message
Генерирует [Cucumber message](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#message) отчет.

Настройте репортер в `playwright.config.js`:
```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('message', { outputFile: 'cucumber-report/report.ndjson' }),
  ],
});
```

<details><summary>Пример <code>report.ndjson</code></summary>

[message report](./../../reporters/_media/message-report.ndjson ':include')

</details>

##### Опции репортера<a id="reporter-options"></a>

* **outputFile** `string` - Путь к выходному NDJSON файлу.
* **skipAttachments** `boolean | string[]` (по умолчанию: `false`) - См. [skipAttachments](#reporter-options) в HTML отчете.

> Обратите внимание, что эти 4 [типа сообщений](https://github.com/cucumber/messages/blob/main/messages.md#envelope) пока не поддерживаются:
> - `parameterType`
> - `stepDefinition`
> - `undefinedParameterType`
> - `parseError`
>
> Если они требуются для вашего отчета, не стесняйтесь [открыть issue](https://github.com/vitalets/playwright-bdd/issues).

## custom
Playwright-BDD поддерживает [пользовательские форматтеры Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/custom_formatters.md).

Создайте файл пользовательского репортера, например, `my-reporter.ts`:
```ts
import * as messages from '@cucumber/messages';
import { Formatter, IFormatterOptions } from '@cucumber/cucumber';

export default class CustomFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options);
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      console.log(JSON.stringify(envelope));
    });
  }
}
```

!> Обратите внимание, что опции конструктора `colorFns`, `snippetBuilder` и `supportCodeLibrary` передаются как фиктивные объекты.

Настройте репортер в `playwright.config.js`:
```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('./my-reporter.ts', { someKey: 'someValue' }),
  ],
});
```

Все опции, переданные в `cucumberReporter()`, будут доступны как `options.parsedArgvOptions`.

## Слияние отчетов

С версии Playwright **1.37** есть команда [merge-reports](https://playwright.dev/docs/test-sharding#merging-reports-from-multiple-shards), которая выводит объединенный отчет из нескольких шардов. Playwright-BDD также поддерживает эту функцию и может создавать объединенные отчеты Cucumber.

Добавьте конфигурацию в `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

// Различайте запуски шардов от обычных локальных запусков и запуска merge-reports
const isShardRun = process.argv.some((a) => a.startsWith('--shard'));

export default defineConfig({
  testDir,
  reporter: isShardRun
    ? 'blob' // на шарде выводить Blob отчет
    : [ cucumberReporter('html', { outputFile: 'report.html' }) ],
});
```

Запустите тесты на шарде:
```
npx bddgen && npx playwright test --shard 1/2
npx bddgen && npx playwright test --shard 2/2
```

Объедините отчеты (важно передать опцию `--config`, указывающую на `playwright.config.ts`):
```
npx playwright merge-reports --config playwright.config.ts ./blob-report
```
