# Опции

## features

?> С версии Playwright-BDD **v7** эта опция заменила опцию `paths` из Cucumber.

- **Тип:** `string | string[]`
- **По умолчанию:** `undefined`

Путь(и) к файлам фич. Может быть директорией или [glob-паттерном](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax).
Пример: `features/**/*.feature`.
Если вы не указываете расширение файла, по умолчанию используется `*.feature`.
Разрешается относительно расположения файла конфигурации.

> С версии Playwright-BDD **v8** вы можете опустить опцию `features` и определить [`featuresRoot`](#featuresroot), которая служит общей базовой директорией как для фич, так и для шагов. Glob-паттерн для фич будет вычислен как `{featuresRoot} + /**/*.feature`.

## steps

?> С версии v7 эта опция заменила опции `require`, `import` и `requireModule` из Cucumber.

- **Тип:** `string | string[]`
- **По умолчанию:** `undefined`

Путь(и) к определениям шагов. Может быть директорией или [glob-паттерном](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax).
Пример: `steps/**/*.ts`.
Если вы не указываете расширение файла, по умолчанию используется `*.{js,mjs,cjs,ts,mts,cts}`.
Разрешается относительно расположения файла конфигурации.

> С версии Playwright-BDD **v8** вы можете опустить опцию `steps` и определить [`featuresRoot`](#featuresroot), которая служит общей базовой директорией как для фич, так и для шагов. Glob-паттерн для шагов будет вычислен как `{featuresRoot} + /**/*.{js,mjs,cjs,ts,mts,cts}`.

## outputDir

- **Тип:** `string`
- **По умолчанию:** `.features-gen`

Директория для вывода сгенерированных тестовых файлов. Разрешается относительно расположения файла конфигурации.

## featuresRoot

- **Тип:** `string`
- **По умолчанию:** *расположение файла конфигурации*

Базовая директория для построения путей сгенерированных файлов внутри `outputDir`. Разрешается относительно расположения файла конфигурации. Обратите внимание, что `featuresRoot` это директория и не может содержать glob-паттерны (`*`).

Поведение аналогично опции [rootDir](https://www.typescriptlang.org/tsconfig#rootDir) в TypeScript, которая устанавливает общего родителя для всех `.ts` файлов и определяет структуру `outDir`.

<details>
  <summary>Пример</summary>

  Представьте следующую структуру проекта:

  ```
  features
    feature1.feature
    subdir
      feature2.feature
  playwright.config.ts
  ```

  Если вы генерируете тесты без `featuresRoot`, вы получите следующий вывод:
  ```
  .features-gen
    features
      feature1.feature.spec.js
      subdir
        feature2.feature.spec.js
  ```

  Если вы не хотите включать директорию `features` в вывод, вы можете установить `featuresRoot: './features'` и тогда все выходные пути будут разрешены от неё:
  ```
  .features-gen
    feature1.feature.spec.js
    subdir
      feature2.feature.spec.js
  ```
</details>

С версии **Playwright-BDD v8** `featuresRoot` служит директорией по умолчанию как для `features`, так и для `steps`, если эти опции не определены явно. Это позволяет использовать более лаконичные конфигурации.

До v8:
```js
const testDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: './features/steps/**/*.js',
  featuresRoot: './features',
});
```

С v8:
```js
const testDir = defineBddConfig({
  featuresRoot: './features',
});
```

Вы все еще можете запустить подмножество фич при необходимости:
```js
const testDir = defineBddConfig({
  featuresRoot: './features',
  features: './features/game/*.feature', // <- запустить только эти фичи
});
```

## language

- **Тип:** `string`
- **По умолчанию:** `en`

[Язык](https://cucumber.io/docs/gherkin/reference/#spoken-languages) по умолчанию для ваших файлов фич.

## aiFix

- **Тип:** `object`
- **По умолчанию:** `undefined`

Набор опций для исправления упавших тестов с помощью AI.

#### Вложенные опции
  * `promptAttachment` *boolean* - прикреплять ли AI промпт к упавшим тестам
  * `promptAttachmentName` *string* - пользовательское имя для вложения промпта
  * `promptTemplate` *string* - пользовательский шаблон для промпта (здесь [по умолчанию](https://github.com/vitalets/playwright-bdd/blob/main/src/ai/promptTemplate.ts))

Пример:

```js
const testDir = defineBddConfig({
  aiFix: {
    promptAttachment: true,
  },
  // ...другие опции
});
```

## examplesTitleFormat

- **Тип:** `string`
- **По умолчанию:** `Example #<_index_>`

Формат заголовка для примеров `Scenario Outline` в сгенерированных тестовых файлах.

## quotes

- **Тип:** `'single' | 'double' | 'backtick'`
- **По умолчанию:** `'single'`

Стиль кавычек в сгенерированных тестовых файлах.

## tags

- **Тип:** `string`

[Выражение с тегами](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions) для фильтрации сценариев при генерации. Также может быть определено опцией CLI `--tags`.

Пример:
```ts
const testDir = defineBddConfig({
  tags: '@desktop and not @slow',
  // ...
});
```

## missingSteps
<div style="color: gray; font-size: 0.8em">с версии <b>v8</b></div>

- **Тип:** `'fail-on-gen' | 'fail-on-run' | 'skip-scenario'`
- **По умолчанию:** `'fail-on-gen'`

Поведение при обнаружении отсутствующих шагов:
- `fail-on-gen` *(по умолчанию)* - генерация тестовых файлов завершится с ошибкой и отобразит [сниппеты](ru/writing-steps/snippets.md) кода для отсутствующих шагов
- `fail-on-run` - тестовые файлы будут сгенерированы, но запуск тестов завершится с ошибкой
- `skip-scenario` - тестовые файлы будут сгенерированы, но сценарии с отсутствующими шагами будут помечены как `fixme`

## matchKeywords
<div style="color: gray; font-size: 0.8em">с версии <b>v8</b></div>

- **Тип:** `boolean`
- **По умолчанию:** `false`

Если включено, ключевое слово также учитывается при поиске определений шагов. См. [Сопоставление ключевых слов](ru/writing-steps/keywords-matching.md).

## verbose

- **Тип:** `boolean`
- **По умолчанию:** `false`

Подробный вывод.

## enrichReporterData

!> С версии Playwright-BDD **v8** эта опция не используется и будет удалена в будущем.

- **Тип:** `boolean`
- **По умолчанию:** `undefined`

Если эта опция включена, Playwright-BDD добавит специальные вложения с BDD данными, необходимыми для отчетов Cucumber. Она включается автоматически, когда вы используете хелпер `cucumberReporter()`. Но для сценариев со [слиянием отчетов](reporters/cucumber.md#merge-reports) вам нужно вручную установить `enrichReporterData: true` при генерации **blob** отчета.

## statefulPoms

- **Тип:** `boolean`
- **По умолчанию:** `false`

Установите эту опцию в `true`, если вы используете шаги-декораторы и ваши Page Object Models имеют состояние. Это включает более строгое угадывание фикстур в сценариях.

**Пример**

Представьте, что у вас следующая структура POM:
```
       BasePage
      /        \
TodoPage         TodoPage2
```
И следующий сценарий:
```gherkin
Scenario: scenario 1
  Given step from BasePage
  When step from TodoPage
  Then step from TodoPage2
```
Какой POM мы должны использовать для 1-го шага: `BasePage`, `TodoPage` или `TodoPage2`?

* Если нет состояния в POM (`statefulPoms: false`): мы будем использовать `BasePage`
* Если есть состояние в POM (`statefulPoms: true`): этот сценарий выдаст ошибку, потому что для `TodoPage` / `TodoPage2` может быть важно вызвать предыдущие шаги

## importTestFrom

?> С версии **v7** вам, скорее всего, не нужна эта опция, она определяется автоматически из определений шагов.

- **Тип:** `string`

Путь к файлу, который экспортирует пользовательский `test` для использования в сгенерированных тестовых файлах.

## paths

!> Устарело, используйте [`features`](#features) вместо этого.

- **Тип:** `string[]`
- **По умолчанию:** `features/**/*.{feature,feature.md}`

Пути к файлам фич. [Подробнее в документации Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features).

## require

!> Устарело, используйте [`steps`](#steps) вместо этого.

- **Тип:** `string[]`
- **По умолчанию:** `features/**/*.(js)`

Пути к определениям шагов в **CommonJS**. [Подробнее в документации Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code).

> Опция Cucumber `requireModule: ['ts-node/register']` не рекомендуется для Playwright-BDD. Компиляция TypeScript выполняется встроенным загрузчиком Playwright.

## import

!> Устарело, используйте [`steps`](#steps) вместо этого.

- **Тип:** `string[]`
- **По умолчанию:** `features/**/*.(js)`

Пути к определениям шагов в [ESM](ru/configuration/esm.md).
