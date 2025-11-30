# Что нового в Playwright-BDD v8

<div style="color: grey; font-style: italic">16-ДЕК-2024</div>

?> :fire: **Playwright-BDD v8** наполнен множеством обновлений для улучшения вашего опыта BDD тестирования.

<!-- command to generate toc in this file: md-magic --files docs/blog/whats-new-in-v8.md -->
<!-- doc-gen TOC maxDepth="3" excludeText="Index" -->
- [Улучшения тегирования](#tagging-enhancements)
  - [Теги из пути](#tags-from-path)
  - [Scoped определения шагов](#scoped-step-definitions)
  - [Тегированные `BeforeAll` и `AfterAll`](#tagged-beforeall-and-afterall)
  - [Теги по умолчанию](#default-tags)
- [Улучшенные опции конфигурации](#improved-configuration-options)
  - [`featuresRoot` как директория по умолчанию](#featuresroot-as-a-default-directory)
  - [Новая опция: `missingSteps`](#new-option-missingsteps)
  - [Новая опция: `matchKeywords`](#new-option-matchkeywords)
  - [Значение по умолчанию для `quotes` установлено в `single`](#default-value-for-quotes-set-to-single)
- [Другие изменения](#other-changes)
  - [Новые псевдонимы хуков](#new-hook-aliases)
  - [Локализованные заголовки шагов](#localized-step-titles)
  - [Обновление версии Playwright](#playwright-version-update)
- [Начало работы с v8](#getting-started-with-v8)<!-- end-doc-gen -->

## Улучшения тегирования<a id="tagging-enhancements"></a>

### Теги из пути<a id="tags-from-path"></a>

Управление тестовыми фичами и определениями шагов стало проще. В v8 вы теперь можете автоматически назначать теги фичам и шагам, используя **имена директорий или файлов с префиксом @**. Например:

```
features
├── @game                     <- устанавливает тег @game для всех файлов внутри
│   ├── game.feature
│   └── steps.ts
└── @video-player             <- устанавливает тег @video-player для всех файлов внутри
    ├── video-player.feature
    └── steps.ts
```

В этой настройке теги `@game` и `@video-player` автоматически применяются к соответствующим фичам и шагам. Это устраняет необходимость в повторяющемся ручном тегировании и помогает связывать фичи с шагами.

Смотрите больше деталей в документации: [теги из пути](writing-features/tags-from-path.md).

### Scoped определения шагов<a id="scoped-step-definitions"></a>

Теперь вы можете ограничить определения шагов конкретными фичами или сценариями с помощью тегов. Просто передайте выражение `tags` во втором аргументе:

```ts
When('I click the PLAY button', { tags: '@game' }, async () => {
  // ...
});
```

Это гарантирует, что один и тот же шаг может сосуществовать в нескольких фичах, упрощая поддержку больших проектов:

```ts
When('start playing', { tags: '@game' }, async () => { ... });
When('start playing', { tags: '@video-player' }, async () => { ... });
```

Полная документация: [scoped определения шагов](writing-steps/scoped.md).

### Тегированные `BeforeAll` и `AfterAll`<a id="tagged-beforeall-and-afterall"></a>
Хуки `BeforeAll` и `AfterAll` теперь поддерживают опции `name` и `tags`:

```ts
BeforeAll({ name: 'populate db', tags: '@game' }, async () => {
  // настройка воркера для игры
});

AfterAll({ name: 'cleanup db', tags: '@game' }, async () => {
  // завершение воркера для игры
});
```

Тегированные хуки будут выполняться только если соответствующая фича выполняется.

?> Имейте в виду, что эти хуки **запускаются в каждом воркере**, аналогично хукам воркера Playwright.

Полная документация: [Хуки](writing-steps/hooks.md).

### Теги по умолчанию<a id="default-tags"></a>

Если множественные определения шагов и хуки должны иметь одинаковые теги, вы можете предоставить эти теги по умолчанию через опцию `createBdd()`:

```ts
const { BeforeAll, Before, Given } = createBdd(test, {
  tags: '@game' // <- тег по умолчанию
});

// все функции ниже помечены `@game`
BeforeAll(async () => { ... });
Before(async () => { ... });
Given('a step', async () => { ... });
```

Полный список [опций createBdd()](api.md#createbdd).

## Улучшенные опции конфигурации<a id="improved-configuration-options"></a>

### `featuresRoot` как директория по умолчанию<a id="featuresroot-as-a-default-directory"></a>
Начиная с Playwright-BDD v8, `featuresRoot` рассматривается как директория по умолчанию для фичей и шагов, если они не определены явно. Это упрощает конфигурацию для типичного проекта:
```ts
// до
const testDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: './features/steps/**/*.js',
  featuresRoot: './features',
});

// после
const testDir = defineBddConfig({
  featuresRoot: './features',
});
```

Документация для [`featuresRoot`](configuration/options.md#featuresroot).

### Новая опция: `missingSteps`<a id="new-option-missingsteps"></a>

Контролируйте поведение когда определения шагов отсутствуют с помощью новой опции `missingSteps`. Выберите между:

- `fail-on-gen` (по умолчанию): падение генерации тестов.
- `fail-on-run`: разрешает генерацию, но падает при выполнении.
- `skip-scenario`: помечает сценарий как `fixme` и пропускает его.

Пример:
```ts
const testDir = defineBddConfig({
  missingSteps: 'skip-scenario',
  // ...
});
```

Документация для [`missingSteps`](configuration/options.md#missingsteps).

### Новая опция: `matchKeywords`<a id="new-option-matchkeywords"></a>

Новая опция `matchKeywords` переключает соответствие ключевых слов для определений шагов. Если включено, `Given`, `When` и `Then` в определениях строго соответствуют их соответствующим ключевым словам в файлах фичей.

- `matchKeywords: false` (по умолчанию): ключевое слово определения шага не учитывается для соответствия
    ```ts
    // соответствует "Given a step", "When a step", "Then a step"
    Given('a step', () => { ... });
    ```

- `matchKeywords: true`: ключевое слово определения шага учитывается для соответствия
    ```ts
    // соответствует только "Given a step"
    Given('a step', () => { ... });
    ```

Больше деталей в [Соответствие ключевых слов](writing-steps/keywords-matching.md).

### Значение по умолчанию для `quotes` установлено в `single`<a id="default-value-for-quotes-set-to-single"></a>
Генерируемые тестовые файлы теперь используют одинарные кавычки по умолчанию, уменьшая потребность в escape символах и делая файлы чище. Чтобы вернуться к предыдущему поведению, установите опцию `quotes` вручную:
```ts
const testDir = defineBddConfig({
  quotes: 'double',
  // ...
});
```

## Другие изменения<a id="other-changes"></a>

### Новые псевдонимы хуков<a id="new-hook-aliases"></a>
Представляем новые псевдонимы для хуков:

- `BeforeAll` → `BeforeWorker`
- `AfterAll` → `AfterWorker`
- `Before` → `BeforeScenario`
- `After` → `AfterScenario`

Использование новых псевдонимов рекомендуется, потому что они лучше выражают, когда хук выполняется.

### Локализованные заголовки шагов<a id="localized-step-titles"></a>
HTML репортер Playwright теперь показывает локализованные заголовки шагов с ключевыми словами:

![Localized HTML report](./../../blog/_media/i18n-html-report.png)

### Обновление версии Playwright<a id="playwright-version-update"></a>
Минимальная версия Playwright была обновлена до самой ранней не-устаревшей: **1.41**.
Пожалуйста, обновите вашу зависимость `@playwright/test` при необходимости.

?> Вы можете проверить устаревшие версии Playwright командой: `npm show @playwright/test@1 deprecated`

---

Ознакомьтесь с полным списком изменений в [Changelog](changelog).

## Начало работы с v8<a id="getting-started-with-v8"></a>

Чтобы обновиться до v8, выполните следующие шаги:

1. Обновите ваш пакет:

   ```bash
   npm install -D playwright-bdd@latest
   ```

2. Настройте ваш конфигурационный файл для включения новых опций по мере необходимости.
3. Просмотрите [Changelog](changelog) для потенциальных критических изменений и адаптируйте ваш проект соответственно.
4. Запустите ваши тесты, чтобы убедиться, что все работает как ожидается.

> В случае каких-либо багов или вопросов, не стесняйтесь открыть [issue](https://github.com/vitalets/playwright-bdd/issues) на GitHub.

Счастливого тестирования ❤️

